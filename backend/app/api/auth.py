from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.database.session import get_db
from app.models.models import User, Farmer
from app.schemas.schemas import RegisterRequest, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    role = payload.role.upper()
    if role not in ("FARMER", "RESEARCHER", "ADMIN"):
        role = "FARMER"
    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        role=role,
    )
    db.add(user)
    db.flush()
    if role == "FARMER":
        db.add(Farmer(
            user_id=user.id,
            phone=payload.phone,
            village=payload.village,
            district=payload.district,
            state=payload.state,
        ))
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token, role=user.role, user_id=user.id, full_name=user.full_name)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(user.id, user.role)
    return TokenResponse(access_token=token, role=user.role, user_id=user.id, full_name=user.full_name)
