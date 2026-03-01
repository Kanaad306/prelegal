import importlib

import pytest


@pytest.fixture(autouse=True)
def isolated_db(tmp_path, monkeypatch):
    """Point PRELEGAL_DB_PATH at a temp file for each test and reload the database module."""
    db_file = tmp_path / "test_prelegal.db"
    monkeypatch.setenv("PRELEGAL_DB_PATH", str(db_file))
    # Reload so DB_PATH re-evaluates with the new env var
    import database
    importlib.reload(database)
    # Patch the module attribute directly so teardown restores it via monkeypatch
    monkeypatch.setattr(database, "DB_PATH", str(db_file))
    yield
