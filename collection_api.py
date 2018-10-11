from cs50 import SQL
from boardgamegeek import BGGClient, CacheBackendSqlite
from flask import jsonify

#configure BGG API
bgg =  BGGClient(cache=CacheBackendSqlite(path="static/cacheapi.db", ttl=3600))

# configure CS50 Library to use SQLite database
db = SQL("sqlite:///bgi.db")
"""fix list of ids"""
def info(user_id):
    user_collection = []
    collection_data_list = []

    """get database collection info"""
    user_games_ids = db.execute("SELECT game_id FROM collections WHERE user_id = :user_id ;", \
        user_id = user_id)

    for game in user_games_ids:
        user_collection.append(game["game_id"])


    if len(user_collection) > 0:
        """get game data"""
        game_list = bgg.game_list(user_collection)

        """get data from every boardgame object"""
        for game in game_list:
            game_status = db.execute("SELECT game_lend FROM collections WHERE user_id = :user_id AND game_id = :game_id;", \
            user_id = user_id, game_id = game.id)
            data = game.data()
            data.update(game_status[0])
            collection_data_list.append(data)

        return jsonify(collection_data_list)
    else:
        return jsonify({'collection': 'empty'})

def add_game(game_id,user_id):
    #Collect information about the game
    game = bgg.game("", int(game_id))
    game_name = game.name
    game_thumbnail = game.thumbnail

    #Insert de game in the database
    result = db.execute("INSERT INTO collections (user_id, game_id, game_name, game_thumbnail, game_lend) \
        VALUES (:user_id, :game_id, :game_name, :game_thumbnail, 0);", \
        user_id = user_id, game_id = int(game_id), game_name = game_name, game_thumbnail = game_thumbnail)



def remove_game(game_id, user_id):
    rows_delete = db.execute("DELETE FROM collections WHERE user_id = :user_id AND game_id = :game_id", game_id = int(game_id), user_id = user_id)
    return str(rows_delete)

def lend_game(game_id, user_id):
    lend_result = db.execute("UPDATE collections SET game_lend = NOT game_lend  WHERE user_id = :user_id AND game_id = :game_id",  game_id = int(game_id), user_id = user_id)
    return lend_result