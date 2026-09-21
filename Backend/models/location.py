from sqlalchemy import Column, Integer, String

from database import Base


class Location(Base):

    __tablename__ = "locations"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    city = Column(
        String(100),
        nullable=False
    )

    area = Column(
        String(100),
        nullable=False
    )

    state = Column(
        String(100),
        nullable=False,
        default="Tamil Nadu"
    )
