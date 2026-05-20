def pagination_skip_limit(page: int, page_size: int) -> tuple[int, int]:
    safe_page = max(1, page)
    safe_size = max(1, min(page_size, 200))
    return (safe_page - 1) * safe_size, safe_size
