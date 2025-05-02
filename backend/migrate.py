#!/usr/bin/env python3
import os
import sys
import subprocess
from datetime import datetime

def run_command(command):
    try:
        subprocess.run(command, check=True, shell=True)
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {command}")
        print(f"Error: {e}")
        sys.exit(1)

def create_migration(message):
    """Create a new migration with the given message."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    migration_name = f"{timestamp}_{message.replace(' ', '_')}"
    run_command(f"alembic revision -m '{migration_name}'")

def upgrade_database(revision="head"):
    """Upgrade the database to the specified revision."""
    run_command(f"alembic upgrade {revision}")

def downgrade_database(revision="-1"):
    """Downgrade the database by one revision."""
    run_command(f"alembic downgrade {revision}")

def show_migration_history():
    """Show the migration history."""
    run_command("alembic history")

def show_current_revision():
    """Show the current database revision."""
    run_command("alembic current")

def init_migrations():
    """Initialize the migrations directory."""
    if not os.path.exists("migrations"):
        run_command("alembic init migrations")
        print("Migrations directory initialized.")
    else:
        print("Migrations directory already exists.")

def help_message():
    """Show help message."""
    print("""
Hospital Management System Migration Script

Usage:
    python migrate.py <command> [args]

Commands:
    init            Initialize migrations directory
    create <msg>    Create a new migration with message
    upgrade [rev]   Upgrade database to revision (default: head)
    downgrade [rev] Downgrade database by revision (default: -1)
    history         Show migration history
    current         Show current revision
    help            Show this help message

Examples:
    python migrate.py init
    python migrate.py create "add user table"
    python migrate.py upgrade
    python migrate.py downgrade
    python migrate.py history
    """)

def main():
    if len(sys.argv) < 2:
        help_message()
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "init":
        init_migrations()
    elif command == "create":
        if len(sys.argv) < 3:
            print("Error: Migration message required")
            sys.exit(1)
        create_migration(sys.argv[2])
    elif command == "upgrade":
        revision = sys.argv[2] if len(sys.argv) > 2 else "head"
        upgrade_database(revision)
    elif command == "downgrade":
        revision = sys.argv[2] if len(sys.argv) > 2 else "-1"
        downgrade_database(revision)
    elif command == "history":
        show_migration_history()
    elif command == "current":
        show_current_revision()
    elif command == "help":
        help_message()
    else:
        print(f"Unknown command: {command}")
        help_message()
        sys.exit(1)

if __name__ == "__main__":
    main() 