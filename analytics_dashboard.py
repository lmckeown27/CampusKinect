#!/usr/bin/env python3
"""
CampusKinect Real-Time Analytics Dashboard
A terminal-based dashboard for monitoring platform metrics in real-time.
"""

import os
import sys
import time
import signal
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from rich.console import Console
from rich.table import Table
from rich.live import Live
from rich.layout import Layout
from rich.panel import Panel
from rich.text import Text
from rich.align import Align
from dotenv import load_dotenv

class DatabaseConnection:
    """Handles PostgreSQL database connections and queries."""
    
    def __init__(self, config: Dict[str, str]):
        self.config = config
        self.connection = None
        self.connect()
    
    def connect(self) -> None:
        """Establish database connection."""
        try:
            self.connection = psycopg2.connect(
                host=self.config['DB_HOST'],
                port=self.config['DB_PORT'],
                database=self.config['DB_NAME'],
                user=self.config['DB_USER'],
                password=self.config['DB_PASSWORD']
            )
            print(f"✅ Connected to database: {self.config['DB_NAME']}")
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            sys.exit(1)
    
    def execute_query(self, query: str, params: tuple = None) -> Optional[list]:
        """Execute a query and return results."""
        try:
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                return cursor.fetchall()
        except Exception as e:
            print(f"❌ Query execution failed: {e}")
            return None
    
    def close(self) -> None:
        """Close database connection."""
        if self.connection:
            self.connection.close()

class MetricsCollector:
    """Collects various platform metrics from the database."""
    
    def __init__(self, db: DatabaseConnection, timezone: str = 'UTC'):
        self.db = db
        self.timezone = timezone
    
    def get_daily_active_users(self) -> int:
        """Get count of unique users active today."""
        query = """
        SELECT COUNT(DISTINCT user_id) as dau
        FROM (
            SELECT user_id FROM posts WHERE DATE(created_at) = CURRENT_DATE
            UNION
            SELECT sender_id as user_id FROM messages WHERE DATE(created_at) = CURRENT_DATE
            UNION
            SELECT receiver_id as user_id FROM messages WHERE DATE(created_at) = CURRENT_DATE
        ) active_users
        """
        result = self.db.execute_query(query)
        return result[0]['dau'] if result else 0
    
    def get_new_posts_today(self) -> int:
        """Get count of posts created today."""
        query = "SELECT COUNT(*) as count FROM posts WHERE DATE(created_at) = CURRENT_DATE"
        result = self.db.execute_query(query)
        return result[0]['count'] if result else 0
    
    def get_messages_sent_today(self) -> int:
        """Get count of messages sent today."""
        query = "SELECT COUNT(*) as count FROM messages WHERE DATE(created_at) = CURRENT_DATE"
        result = self.db.execute_query(query)
        return result[0]['count'] if result else 0
    
    def get_top_posts_today(self) -> list:
        """Get top 5 most engaged posts today."""
        query = """
        SELECT title, author_name, score, view_count
        FROM posts 
        WHERE DATE(created_at) = CURRENT_DATE
        ORDER BY score DESC, view_count DESC
        LIMIT 5
        """
        result = self.db.execute_query(query)
        return result if result else []
    
    def get_active_universities(self) -> int:
        """Get count of universities with active users today."""
        query = """
        SELECT COUNT(DISTINCT u.university_id) as count
        FROM users u
        INNER JOIN (
            SELECT user_id FROM posts WHERE DATE(created_at) = CURRENT_DATE
            UNION
            SELECT sender_id as user_id FROM messages WHERE DATE(created_at) = CURRENT_DATE
        ) active ON u.id = active.user_id
        """
        result = self.db.execute_query(query)
        return result[0]['count'] if result else 0
    
    def get_user_registrations_today(self) -> int:
        """Get count of new user registrations today."""
        query = "SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURRENT_DATE"
        result = self.db.execute_query(query)
        return result[0]['count'] if result else 0

class DashboardRenderer:
    """Handles the visual rendering of the dashboard."""
    
    def __init__(self, console: Console):
        self.console = console
    
    def create_metrics_table(self, metrics: Dict[str, Any], enabled_metrics: Dict[str, bool]) -> Table:
        """Create a table displaying current metrics."""
        table = Table(title="📊 CampusKinect Live Metrics", show_header=True, header_style="bold blue")
        table.add_column("Metric", style="cyan", width=25)
        table.add_column("Value", style="green", width=15)
        table.add_column("Status", style="yellow", width=10)
        
        metric_configs = [
            ("METRIC_DAU", "Daily Active Users", metrics.get('dau', 0)),
            ("METRIC_NEW_POSTS", "New Posts Today", metrics.get('new_posts', 0)),
            ("METRIC_MESSAGES_SENT", "Messages Sent Today", metrics.get('messages_sent', 0)),
            ("METRIC_TOP_POSTS", "Top Posts Today", len(metrics.get('top_posts', []))),
            ("METRIC_ACTIVE_UNIVERSITIES", "Active Universities", metrics.get('active_universities', 0)),
            ("METRIC_USER_REGISTRATIONS", "New Registrations", metrics.get('user_registrations', 0)),
        ]
        
        for metric_key, metric_name, value in metric_configs:
            if enabled_metrics.get(metric_key, False):
                table.add_row(metric_name, str(value), "🟢 ON")
            else:
                table.add_row(metric_name, "-", "🔴 OFF")
        
        return table
    
    def create_header_panel(self, last_updated: str) -> Panel:
        """Create the header panel with title and last updated time."""
        header_text = Text("CampusKinect Analytics Dashboard", style="bold white")
        subtitle = Text(f"Last Updated: {last_updated}", style="dim white")
        content = Align.center(header_text + "\n" + subtitle)
        return Panel(content, style="bold blue", padding=(1, 1))
    
    def create_top_posts_panel(self, top_posts: list) -> Panel:
        """Create a panel showing top posts if enabled."""
        if not top_posts:
            content = Text("No posts today", style="dim")
        else:
            content = ""
            for i, post in enumerate(top_posts, 1):
                title = post['title'][:40] + "..." if len(post['title']) > 40 else post['title']
                content += f"{i}. {title}\n"
                content += f"   👤 {post['author_name']} | 🏆 {post['score']} pts | 👀 {post['view_count']} views\n\n"
        
        return Panel(content, title="🔥 Top Posts Today", style="yellow")

class AnalyticsDashboard:
    """Main dashboard application."""
    
    def __init__(self):
        self.console = Console()
        self.config = self.load_config()
        self.enabled_metrics = self.load_enabled_metrics()
        self.db = DatabaseConnection(self.config)
        self.metrics_collector = MetricsCollector(self.db, self.config.get('TIMEZONE', 'UTC'))
        self.renderer = DashboardRenderer(self.console)
        self.running = True
        
        # Setup signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
    
    def load_config(self) -> Dict[str, str]:
        """Load configuration from .env.analytics file."""
        if not os.path.exists('.env.analytics'):
            self.console.print("❌ .env.analytics file not found!", style="bold red")
            sys.exit(1)
        
        load_dotenv('.env.analytics')
        
        required_vars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']
        config = {}
        
        for var in required_vars:
            value = os.getenv(var)
            if not value:
                self.console.print(f"❌ Missing required environment variable: {var}", style="bold red")
                sys.exit(1)
            config[var] = value
        
        # Optional variables with defaults
        config['REFRESH_INTERVAL'] = int(os.getenv('REFRESH_INTERVAL', 10))
        config['TIMEZONE'] = os.getenv('TIMEZONE', 'UTC')
        
        return config
    
    def load_enabled_metrics(self) -> Dict[str, bool]:
        """Load which metrics are enabled from environment."""
        metric_vars = [
            'METRIC_DAU', 'METRIC_NEW_POSTS', 'METRIC_MESSAGES_SENT',
            'METRIC_TOP_POSTS', 'METRIC_ACTIVE_UNIVERSITIES',
            'METRIC_USER_REGISTRATIONS', 'METRIC_FULFILLMENT_RATE',
            'METRIC_POST_CATEGORIES'
        ]
        
        enabled = {}
        for var in metric_vars:
            enabled[var] = os.getenv(var, 'false').lower() == 'true'
        
        return enabled
    
    def collect_metrics(self) -> Dict[str, Any]:
        """Collect all enabled metrics."""
        metrics = {}
        
        try:
            if self.enabled_metrics.get('METRIC_DAU'):
                metrics['dau'] = self.metrics_collector.get_daily_active_users()
            
            if self.enabled_metrics.get('METRIC_NEW_POSTS'):
                metrics['new_posts'] = self.metrics_collector.get_new_posts_today()
            
            if self.enabled_metrics.get('METRIC_MESSAGES_SENT'):
                metrics['messages_sent'] = self.metrics_collector.get_messages_sent_today()
            
            if self.enabled_metrics.get('METRIC_TOP_POSTS'):
                metrics['top_posts'] = self.metrics_collector.get_top_posts_today()
            
            if self.enabled_metrics.get('METRIC_ACTIVE_UNIVERSITIES'):
                metrics['active_universities'] = self.metrics_collector.get_active_universities()
            
            if self.enabled_metrics.get('METRIC_USER_REGISTRATIONS'):
                metrics['user_registrations'] = self.metrics_collector.get_user_registrations_today()
            
        except Exception as e:
            self.console.print(f"❌ Error collecting metrics: {e}", style="bold red")
        
        return metrics
    
    def render_dashboard(self) -> Layout:
        """Render the complete dashboard layout."""
        metrics = self.collect_metrics()
        last_updated = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        layout = Layout()
        
        # Create header
        header = self.renderer.create_header_panel(last_updated)
        
        # Create metrics table
        metrics_table = self.renderer.create_metrics_table(metrics, self.enabled_metrics)
        
        # Create layout structure
        layout.split_column(
            Layout(header, size=4, name="header"),
            Layout(metrics_table, name="metrics")
        )
        
        # Add top posts panel if enabled
        if self.enabled_metrics.get('METRIC_TOP_POSTS') and metrics.get('top_posts'):
            top_posts_panel = self.renderer.create_top_posts_panel(metrics['top_posts'])
            layout["metrics"].split_row(
                Layout(metrics_table, name="table"),
                Layout(top_posts_panel, name="top_posts")
            )
        
        return layout
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals gracefully."""
        self.running = False
        self.console.print("\n🛑 Shutting down dashboard...", style="bold yellow")
    
    def run(self):
        """Run the dashboard with live updates."""
        self.console.print("🚀 Starting CampusKinect Analytics Dashboard...", style="bold green")
        
        try:
            with Live(self.render_dashboard(), console=self.console, refresh_per_second=1) as live:
                while self.running:
                    live.update(self.render_dashboard())
                    time.sleep(self.config['REFRESH_INTERVAL'])
        
        except KeyboardInterrupt:
            pass
        finally:
            self.db.close()
            self.console.print("✅ Dashboard stopped. Database connection closed.", style="bold green")

def main():
    """Main entry point."""
    try:
        dashboard = AnalyticsDashboard()
        dashboard.run()
    except Exception as e:
        print(f"❌ Dashboard startup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 