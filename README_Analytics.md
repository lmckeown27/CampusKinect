# CampusKinect Analytics Dashboard

A real-time terminal-based analytics dashboard for monitoring CampusKinect platform metrics.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
Make sure your `.env.analytics` file is properly configured with your database credentials and enabled metrics.

### 3. Run the Dashboard
```bash
python analytics_dashboard.py
```

## 📊 Available Metrics

### Core Metrics (MVP)
- **Daily Active Users (DAU)**: Unique users who posted or messaged today
- **New Posts Today**: Count of posts created today
- **Messages Sent Today**: Count of messages sent today

### Extended Metrics (Optional)
- **Top Posts Today**: Top 5 most engaged posts by score and views
- **Active Universities**: Universities with active users today
- **User Registrations**: New user sign-ups today
- **Fulfillment Rate**: Coming soon
- **Post Categories**: Coming soon

## ⚙️ Configuration

Edit your `.env.analytics` file to enable/disable specific metrics:

```bash
# Enable a metric
METRIC_DAU=true
METRIC_TOP_POSTS=true

# Disable a metric
METRIC_FULFILLMENT_RATE=false
```

### Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host | Required |
| `DB_PORT` | Database port | Required |
| `DB_NAME` | Database name | Required |
| `DB_USER` | Database user | Required |
| `DB_PASSWORD` | Database password | Required |
| `REFRESH_INTERVAL` | Update frequency (seconds) | 10 |
| `TIMEZONE` | Display timezone | UTC |

## 🎮 Controls

- **Ctrl+C**: Gracefully stop the dashboard
- The dashboard auto-refreshes every 10 seconds (configurable)

## 🔧 Adding New Metrics

To add a new metric:

1. **Add to `.env.analytics`**:
   ```bash
   METRIC_YOUR_NEW_METRIC=true
   ```

2. **Add collection method to `MetricsCollector` class**:
   ```python
   def get_your_new_metric(self) -> int:
       query = "SELECT COUNT(*) as count FROM your_table WHERE condition"
       result = self.db.execute_query(query)
       return result[0]['count'] if result else 0
   ```

3. **Add to metrics collection in `collect_metrics()` method**:
   ```python
   if self.enabled_metrics.get('METRIC_YOUR_NEW_METRIC'):
       metrics['your_new_metric'] = self.metrics_collector.get_your_new_metric()
   ```

4. **Add to display in `create_metrics_table()` method**:
   ```python
   ("METRIC_YOUR_NEW_METRIC", "Your Metric Name", metrics.get('your_new_metric', 0)),
   ```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify your `.env.analytics` file has correct database credentials
- Ensure your database server is accessible from your current network
- Check if PostgreSQL is running on the specified host/port

### Missing Dependencies
```bash
pip install --upgrade -r requirements.txt
```

### Permission Issues
Make sure the dashboard script is executable:
```bash
chmod +x analytics_dashboard.py
```

## 📋 System Requirements

- Python 3.7+
- PostgreSQL database access
- Terminal with color support (for best experience)

## 🔒 Security Notes

- Keep your `.env.analytics` file secure and never commit it to version control
- Use read-only database credentials when possible
- The dashboard only performs SELECT queries - no data modification 