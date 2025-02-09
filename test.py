
# < ========================================================
# < Imports
# < ========================================================

from requests import Response, post

# < ========================================================
# < Constants
# < ========================================================

BASE_URL: str = "https://jsonblob.com/api/jsonBlob/"

# < ========================================================
# < Functionality
# < ========================================================

def full_url(identifier: int) -> str:
    """Get the full URL for a given identifier"""
    url: str = f"{BASE_URL}{identifier}"
    return url

def create(data: dict) -> str | None:
    """Create a new JSONBlob and return the identifier integer"""
    response: Response = post(BASE_URL, json = data)
    if response.status_code == 201:
        identifier: int = response.headers["Location"].split("/")[-1]
        return identifier
    
# < ========================================================
# < Execution
# < ========================================================

if __name__ == "__main__":
    print(f"Empty JSONBlob created: {full_url(create({}))}")