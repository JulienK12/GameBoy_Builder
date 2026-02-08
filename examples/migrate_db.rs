use sqlx::postgres::PgPoolOptions;
use std::env;
use dotenvy::dotenv;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    
    let database_url = env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set in .env");

    println!("🐘 Connecting to PostgreSQL...");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    println!("📦 Running individual migration steps...");
    
    let statements = vec![
        "ALTER TABLE shell_variants ADD COLUMN IF NOT EXISTS is_transparent BOOLEAN NOT NULL DEFAULT FALSE",
        "ALTER TABLE shell_variants ADD COLUMN IF NOT EXISTS source_url TEXT",
        "ALTER TABLE shell_variants ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE",
        "ALTER TABLE shell_variants ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP",
    ];

    for stmt in statements {
        println!("   ⚡ Executing: {}", stmt);
        match sqlx::query(stmt).execute(&pool).await {
            Ok(_) => println!("      ✅ Success"),
            Err(e) => {
                // If it's a "duplicate column" error, we might ignore it if IF NOT EXISTS failed for some reason,
                // but IF NOT EXISTS should handle it.
                eprintln!("      ❌ Error: {}", e);
                return Err(e.into());
            }
        }
    }

    println!("\n🎉 All migration steps applied successfully!");
    Ok(())
}
