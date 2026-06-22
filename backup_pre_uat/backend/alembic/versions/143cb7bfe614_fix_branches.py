"""Fix branches

Revision ID: 143cb7bfe614
Revises: 143cb7bfe613
Create Date: 2026-06-21 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '143cb7bfe614'
down_revision: Union[str, None] = '143cb7bfe613'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    with op.batch_alter_table('branches') as batch_op:
        try:
            batch_op.drop_column('email')
            batch_op.drop_column('contact_number')
            batch_op.drop_column('status')
            batch_op.drop_column('updated_at')
            batch_op.drop_column('created_at')
            batch_op.alter_column('address', nullable=True)
        except Exception:
            pass

def downgrade() -> None:
    pass
