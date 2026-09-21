from sqlalchemy import Column, Integer, String, ForeignKey

from database import Base


class ShowTiming(Base):

    __tablename__ = "show_timings"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    movie_id = Column(
        Integer,
        ForeignKey(
            "movies.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    theatre_id = Column(
        Integer,
        ForeignKey(
            "theatres.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    language = Column(
        String(100),
        nullable=False
    )

    show_time = Column(
        String(50),
        nullable=False
    )

    price = Column(
        Integer,
        nullable=False
    )
