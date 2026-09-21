from fastapi import FastAPI

from database import Base, engine
import models
from fastapi.middleware.cors import CORSMiddleware

from routes import auth
from routes import movies
from routes import bookings
from routes import locations
from routes import theatres
from routes import show_timings
from routes import movie_theatres


app = FastAPI()

# Create database tables if they do not already exist
Base.metadata.create_all(bind=engine)


app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://40.192.61.165",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(movies.router)
app.include_router(bookings.router)
app.include_router(locations.router)
app.include_router(theatres.router)
app.include_router(show_timings.router)
app.include_router(movie_theatres.router)


@app.get("/")
def root():

    return {
        "message": "MovieHub Backend Running"
    }
