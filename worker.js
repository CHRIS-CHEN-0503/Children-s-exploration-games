export class GameRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
  }

  async fetch(request) {
    const url = new URL(request.url);
    const upgrade = request.headers.get("Upgrade") || "";
    if (upgrade.toLowerCase() !== "websocket") {
      return new Response("WebSocket only endpoint", { status: 426 });
    }

    const playerName = (url.searchParams.get("name") || "小探險家").slice(0, 16);
    const playerId = (url.searchParams.get("id") || crypto.randomUUID()).slice(0, 64);

    const [client, server] = Object.values(new WebSocketPair());
    let acceptState = "ok";
    await this.state.blockConcurrencyWhile(async () => {
      if (this.sessions.has(playerId)) {
        acceptState = "dup";
        return;
      }
      if (this.sessions.size >= 3) {
        acceptState = "full";
        return;
      }

      this.sessions.set(playerId, {
        socket: server,
        id: playerId,
        name: playerName,
        x: Number(url.searchParams.get("x") || 2),
        y: Number(url.searchParams.get("y") || 2),
        color: "#2d8bf3",
        lastAt: Date.now()
      });
    });

    if (acceptState === "full" || acceptState === "dup") {
      return new Response(
        JSON.stringify({
          type: "full",
          state: acceptState,
          text: acceptState === "full" ? "room full" : "duplicate id"
        }),
        {
          status: 409,
          headers: { "content-type": "application/json" }
        }
      );
    }

    server.accept();

    const allPlayers = [...this.sessions.values()].map((p) => ({
      id: p.id,
      name: p.name,
      x: p.x,
      y: p.y
    }));
    server.send(
      JSON.stringify({
        type: "state",
        players: allPlayers
      })
    );

    this.broadcast(
      JSON.stringify({
        type: "system",
        text: `${playerName} 來到房間`
      }),
      playerId
    );
    this.broadcast(
      JSON.stringify({
        type: "peer-join",
        id: playerId,
        name: playerName
      }),
      playerId
    );

    server.addEventListener("message", (event) => {
      let message = {};
      try {
        message = JSON.parse(event.data);
      } catch (error) {
        try {
          server.send(
            JSON.stringify({
              type: "system",
              text: "收到非 JSON 訊息，已忽略。"
            })
          );
        } catch {
          // noop
        }
        return;
      }

      const payload = message || {};
      if (payload.type === "join") {
        const p = this.sessions.get(playerId);
        if (p) {
          p.name = payload.name || p.name;
          p.x = payload.x ?? p.x;
          p.y = payload.y ?? p.y;
          p.color = payload.color || p.color;
        }
        this.broadcast(
          JSON.stringify({
            type: "peer-join",
            id: playerId,
            name: p?.name || playerName,
            x: p?.x || 2,
            y: p?.y || 2
          }),
          playerId
        );
      }

      if (payload.type === "move") {
        const p = this.sessions.get(playerId);
        if (!p) return;
        p.x = payload.x;
        p.y = payload.y;
        p.lastAt = Date.now();
        this.broadcast(
          JSON.stringify({
            type: "move",
            id: playerId,
            name: p.name,
            x: p.x,
            y: p.y
          }),
          playerId
        );
      }

      if (payload.type === "chat") {
        const sender = this.sessions.get(playerId);
        this.broadcast(
          JSON.stringify({
            type: "chat",
            id: playerId,
            name: sender?.name || "匿名",
            text: payload.text
          }),
          playerId
        );
      }

      if (payload.type === "quest-complete") {
        this.broadcast(
          JSON.stringify({
            type: "system",
            text: `${this.sessions.get(playerId)?.name || "玩家"} 完成了任務 ${payload.id}。`
          }),
          playerId
        );
      }

      if (payload.type === "purchase") {
        this.broadcast(
          JSON.stringify({
            type: "system",
            text: `${this.sessions.get(playerId)?.name || "玩家"} 購買了 ${payload.name || payload.id}。`
          }),
          playerId
        );
      }
    });

    server.addEventListener("close", () => {
      const p = this.sessions.get(playerId);
      this.sessions.delete(playerId);
      if (p) {
        this.broadcast(
          JSON.stringify({
            type: "peer-leave",
            id: playerId,
            name: p.name
          })
        );
      }
    });

    server.addEventListener("error", () => {
      this.sessions.delete(playerId);
    });

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  broadcast(message, skipId = null) {
    for (const [id, session] of this.sessions) {
      if (id === skipId) continue;
      try {
        session.socket.send(message);
      } catch {
        this.sessions.delete(id);
      }
    }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const room = (url.searchParams.get("room") || "town-01").replace(/[^a-zA-Z0-9-_]/g, "-");
    const id = env.GAME_ROOMS.idFromName(room);
    const roomStub = env.GAME_ROOMS.get(id);
    return roomStub.fetch(request);
  }
}
