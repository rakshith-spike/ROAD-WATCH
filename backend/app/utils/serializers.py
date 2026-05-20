def mongo_doc_to_dict(doc: dict | None) -> dict | None:
    if not doc:
        return None
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc
