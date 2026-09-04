from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    backend_api_host: str
    backend_api_port: int
    db_host: str
    db_port: int
    db_user: str
    db_pass: str
    db_name: str

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+asyncpg://"
            f"{self.db_user}:{self.db_pass}"
            f"@{self.db_host}:{self.db_port}"
            f"/{self.db_name}"
        )


settings = Settings()