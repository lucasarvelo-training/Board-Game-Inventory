from helpers import *
from collection_api import info, add_game, remove_game, lend_game
from cs50 import SQL
from flask import Flask, jsonify, render_template, request, url_for
from flask_jsglue import JSGlue
from flask_session import Session
from passlib.apps import custom_app_context as pwd_context
from tempfile import mkdtemp
import re
import json
from bgg_api import hot_list, info_games


# configure application
app = Flask(__name__)
JSGlue(app)

"""
# ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response
"""

# configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# configure CS50 Library to use SQLite database
db = SQL("sqlite:///bgi.db")

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user."""

    # forget any user_id
    session.clear()

    # if user reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        inputEmail = request.form.get("email")
        inputPassword = request.form.get("psw")
        inputRepassword = request.form.get("pswRepeat")

        if not inputEmail:
            return apology("must provide email")

        elif not re.match("^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$", inputEmail):
            return apology("Invalid Email Format")

        elif not inputPassword:
            return apology("must provide password")

        elif inputPassword != inputRepassword:
            return apology("password and re-password don't match")

        existEmail = db.execute("SELECT id FROM users WHERE email = :email", email = inputEmail)

        if len(existEmail) > 0:
            return apology("User already exist")

        else:
            #hash password
            hashPassword = pwd_context.hash(inputPassword)

            # insert in db
            result = db.execute("INSERT INTO users (email, pwd) VALUES (:email, :pwd)", \
                 email = inputEmail, pwd = hashPassword)
            if not result:
                return apology("Error 10125 DB")

            # remember which user has logged in
            user_r = db.execute("SELECT * FROM users WHERE email = :email", email=inputEmail)
            session["user_id"] = user_r[0]["id"]

            # redirect user to home page
            return redirect(url_for("index"))

    # else if user reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("index.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in."""

    # forget any user_id
    session.clear()

    inputEmail = request.form.get("email")
    inputPassword = request.form.get("psw")

    # if user reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        # ensure username was submitted
        if not inputEmail:
            return apology("must provide email")

        # ensure password was submitted
        elif not inputPassword:
            return apology("must provide password")

        # query database for username
        rows = db.execute("SELECT * FROM users WHERE email = :email", email=inputEmail)

        # ensure username exists and password is correct
        if len(rows) != 1 or not pwd_context.verify(inputPassword, rows[0]["pwd"]):
            return apology("invalid username and/or password")

        # remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # redirect user to home page
        return redirect(url_for("index"))

    # else if user reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("index.html")


@app.route("/logout")
@login_required
def logout():
    """Log user out."""

    # forget any user_id
    session.clear()

    # redirect user to login form
    return redirect(url_for("index"))

@app.route("/usercheck", methods=["GET", "POST"])
def usercheck():
    # if user reached route via POST (as by submitting a form via POST)
    if request.method == "POST":

        """Check if user exist in DB"""
        inputEmail = request.form.get("email")
        # query database for username
        existEmail = db.execute("SELECT id FROM users WHERE email = :email", email = inputEmail)
        response = "true";

        if len(existEmail) > 0:
            response = "true";
            return json.dumps({'status':'OK','response':response, 'db':existEmail});
        else:
            response = "false";
            return json.dumps({'status':'OK','response':response, 'db':existEmail});

    # else if user reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("index.html")

@app.route("/search")
@login_required
def search():
    query = request.args.get("q")
    result = info_games(query)
    return (result)


@app.route("/hot")
@login_required
def hot():
    result = hot_list()
    return (result)

@app.route("/search_boardgame")
@login_required
def search_boardgame():
    return render_template("search.html")

@app.route("/collection", methods=["GET"])
@login_required
def collection():
    option = request.args.get("option")
    if option == "user_collection":
        user_id = session.get("user_id")
        result = info(user_id)
        return result
    elif option == "add_game":
        game_id = request.args.get("id")
        user_id = session.get("user_id")
        check = db.execute("SELECT game_name FROM collections WHERE user_id = :user_id AND game_id = :game_id ;", \
        user_id = user_id, game_id = int(game_id))
        if len(check) == 0:
            add_game(game_id, user_id)
            return "0"
        else:
            return "game exist in collection"
    elif option == "remove_game":
        game_id = request.args.get("id")
        user_id = session.get("user_id")
        result = remove_game(game_id, user_id)
        return result
    elif option == "lend_game":
        game_id = request.args.get("id")
        user_id = session.get("user_id")
        result = lend_game(game_id, user_id)
        if result > 0:
            return "Game Lend/Return"
        else:
            return "0"
    else:
        return "bad"