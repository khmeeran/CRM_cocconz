"""add_division_to_classes

Revision ID: a03fa3b94029
Revises: 81ba6d1355e0
Create Date: 2026-06-19 12:32:13.231642

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a03fa3b94029'
down_revision: Union[str, None] = '81ba6d1355e0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Add division column to classes table using batch mode for SQLite support ---
    with op.batch_alter_table('classes', schema=None) as batch_op:
        batch_op.add_column(sa.Column('division', sa.String(), nullable=True))

    # --- Classify existing records ---
    op.execute("UPDATE classes SET division = 'Preschool' WHERE name IN ('Pre-KG', 'LKG', 'UKG')")
    op.execute("UPDATE classes SET division = 'Primary' WHERE name IN ('1st Std', '2nd Std')")
    op.execute("UPDATE classes SET division = 'Preschool' WHERE division IS NULL")


def downgrade() -> None:
    with op.batch_alter_table('classes', schema=None) as batch_op:
        batch_op.drop_column('division')

    # ### end Alembic commands ###
