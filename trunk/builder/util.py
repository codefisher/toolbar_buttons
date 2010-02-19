import os

def get_button_folders(limit, data_folder="data"):
    folders = get_folders(limit, data_folder)
    return [os.path.join(data_folder, folder) for folder in folders], folders
    
def get_locale_folders(limit, data_folder="locale"):
    folders = get_folders(limit, data_folder)
    return [os.path.join(data_folder, folder) for folder in folders], folders
    
def get_folders(limit, folder):
    """Gets all the folders inside another and applies some filtering to it
    
    filter maybe the value "all" or a comer seperated list of values
    
    get_folders(str, str) -> list<str>
    """
    folders = [file_name for file_name in os.listdir(folder) 
               if not file_name.startswith(".")]
    if limit == "all":
        return folders
    else:
        return list(set(folders).intersection(set(limit.split(","))))