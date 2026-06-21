"""Phase 2D - Add collection fields to PaymentHistory

Revision ID: b04e5b77acd1
Revises: ecf714851cee
Create Date: 2026-06-21 15:21:35.405021

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b04e5b77acd1'
down_revision: Union[str, None] = 'ecf714851cee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE payment_history ADD COLUMN assignment_id VARCHAR REFERENCES student_fee_assignments(id)")
    op.execute("ALTER TABLE payment_history ADD COLUMN fee_head_id VARCHAR REFERENCES fee_heads(id)")


def downgrade() -> None:
    pass
