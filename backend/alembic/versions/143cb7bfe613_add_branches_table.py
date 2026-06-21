"""Add branches table

Revision ID: 143cb7bfe613
Revises: a03fa3b94029
Create Date: 2026-06-21 11:44:16.409018

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '143cb7bfe613'
down_revision: Union[str, None] = 'a03fa3b94029'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('branches') as batch_op:
        batch_op.add_column(sa.Column('code', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('contact_email', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('contact_phone', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('is_active', sa.Boolean(), nullable=True, server_default='1'))
        batch_op.create_index(batch_op.f('ix_branches_code'), ['code'], unique=True)


def downgrade() -> None:
    with op.batch_alter_table('branches') as batch_op:
        batch_op.drop_index(batch_op.f('ix_branches_code'))
        batch_op.drop_column('is_active')
        batch_op.drop_column('contact_phone')
        batch_op.drop_column('contact_email')
        batch_op.drop_column('code')
