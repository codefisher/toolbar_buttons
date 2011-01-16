import os

def get_button_folders(limit, data_folder="data"):
    return get_folders(limit, data_folder)

def get_locale_folders(limit, data_folder="locale"):
    return get_folders(limit, data_folder)

def get_pref_folders(limit, data_folder="options"):
    return get_folders(limit, data_folder)

def get_folders(limit, folder):
    """Gets all the folders inside another and applies some filtering to it

    filter maybe the value "all" or a comer seperated list of values

    get_folders(str, str) -> list<str>
    """
    folders = [file_name for file_name in os.listdir(folder)
               if not file_name.startswith(".")]
    if limit != "all":
        if type(limit) == basestring:
            limit = limit.split(",")
        folders = list(set(folders).intersection(set(limit)))
    return [os.path.join(folder, sub_folder) for sub_folder in folders], folders