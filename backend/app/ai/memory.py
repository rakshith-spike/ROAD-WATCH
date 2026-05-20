from collections import defaultdict, deque


class SessionMemory:
    def __init__(self, max_items: int = 5) -> None:
        self.max_items = max_items
        self.store: dict[str, deque[str]] = defaultdict(lambda: deque(maxlen=max_items))

    def add(self, session_id: str, message: str) -> None:
        self.store[session_id].append(message)

    def context(self, session_id: str) -> str:
        return "\n".join(self.store[session_id])


memory_store = SessionMemory()
