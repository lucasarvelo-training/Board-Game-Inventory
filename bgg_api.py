from boardgamegeek import BGGClient
from flask import jsonify

bgg =  BGGClient()
"""function for search test"""
def search_games(game_name):
    result_list = bgg.search(game_name)
    data_list = []
    for game in result_list:
        data_list.append(game.data())
    return jsonify(data_list)

"""get all info from every game"""
def info_games(game_name):
    game_list = []
    game_id_list = []
    game_data_list = []

    """search for games"""
    search = bgg.search(game_name)
    """create a list with all the game ids from the search"""
    for game in search:
        game_id_list.append(game.id)
    """request a list of games objets with game_id_list"""
    game_list = bgg.game_list(game_id_list)
    """get data from every boardgame object"""
    for game in game_list:
        game_data_list.append(game.data())


    return jsonify(game_data_list)

"""get hot list from bgg"""
def hot_list():
    hot_items = []
    hot_item_list = []

    hot_items = bgg.hot_items("boardgame")
    for game in hot_items:
        hot_item_list.append(game.data())

    return jsonify(hot_item_list)

