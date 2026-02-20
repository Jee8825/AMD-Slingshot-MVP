import time

def profile_imports():
    start_total = time.time()
    
    start = time.time()
    from contextlib import asynccontextmanager
    print(f"contextlib: {time.time()-start:.4f}s")
    
    start = time.time()
    from fastapi import FastAPI
    print(f"fastapi: {time.time()-start:.4f}s")
    
    start = time.time()
    from passlib.context import CryptContext
    print(f"passlib: {time.time()-start:.4f}s")
    
    start = time.time()
    import app.database
    print(f"app.database: {time.time()-start:.4f}s")
    
    start = time.time()
    import app.utils.hashing
    print(f"app.utils.hashing: {time.time()-start:.4f}s")

    start = time.time()
    import app.routers.auth
    print(f"app.routers.auth: {time.time()-start:.4f}s")
    
    start = time.time()
    import app.main
    print(f"app.main: {time.time()-start:.4f}s")
    
    print(f"Total: {time.time()-start_total:.4f}s")

if __name__ == "__main__":
    profile_imports()
