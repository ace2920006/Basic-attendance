# Enhanced Attendance Management System

A comprehensive desktop attendance application built with Python, Tkinter, and SQLite, featuring advanced analytics, bulk operations, and automated alerts.

## 🚀 Features

### Core Features
- **Student Management**: Add, edit, and manage student information with contact details
- **Attendance Marking**: Mark attendance with present/absent/late status
- **Records Viewing**: View and export attendance records
- **Database Backup**: Automatic database backup functionality

### Enhanced Features
- **Analytics Dashboard**: Comprehensive attendance statistics with charts and trends
- **Enhanced Attendance Marking**: Detailed attendance tracking with arrival/departure times and notes
- **Bulk Operations**: Import/export students, bulk attendance marking, class-specific operations
- **Alerts & Notifications**: Automated alerts for low attendance, consecutive absences, and late arrivals
- **Advanced Reporting**: Date range filtering, class comparisons, and detailed statistics

### Analytics & Reporting
- **Attendance Statistics**: Individual and class-wide attendance percentages
- **Trend Analysis**: Visual charts showing attendance patterns over time
- **Class Comparisons**: Compare attendance rates across different classes
- **Export Capabilities**: CSV export for all data and reports
- **Parent Notifications**: Automated alerts for low attendance

### Bulk Operations
- **CSV Import/Export**: Bulk student import/export with templates
- **Date Range Operations**: Mark attendance for multiple days at once
- **Class-Specific Actions**: Operations targeted at specific classes
- **Student ID Generation**: Automatic generation of student IDs

## 📁 Structure
```
attendance_app/
├── main.py                          # Application entry point
├── requirements.txt                 # Python dependencies
├── README.md                        # This file
├── gui/                            # User interface modules
│   ├── main_window.py              # Main application window
│   ├── student_manager.py          # Student management interface
│   ├── attendance_marker.py        # Basic attendance marking
│   ├── enhanced_attendance_marker.py # Advanced attendance features
│   ├── records_viewer.py           # Attendance records viewer
│   ├── analytics_dashboard.py     # Analytics and reporting
│   ├── bulk_operations.py         # Bulk operations interface
│   └── attendance_alerts.py        # Alerts and notifications
├── data/                           # Data management
│   ├── database.py                 # Database operations
│   └── csv_handler.py              # CSV import/export utilities
└── utils/                          # Utility modules
    ├── helpers.py                  # Helper functions
    └── logger.py                   # Logging utilities
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Installation Steps
1. **Clone or download** the attendance app to your local machine
2. **Navigate** to the attendance_app directory:
   ```bash
   cd attendance_app
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Run the application**:
   ```bash
   python main.py
   ```

## 📊 Usage Guide

### Getting Started
1. **Launch the application** using `python main.py`
2. **Add students** using the "Students" tab
3. **Mark attendance** using either "Mark Attendance" or "Enhanced Attendance" tabs
4. **View records** and generate reports using the "Records" tab

### Key Features Usage

#### Analytics Dashboard
- Select date ranges and class filters
- View attendance statistics and trends
- Generate charts and reports
- Export data to CSV

#### Enhanced Attendance Marking
- Set late arrival thresholds
- Track arrival and departure times
- Add notes for individual students
- Auto-mark late arrivals

#### Bulk Operations
- Import students from CSV files
- Export attendance data
- Perform bulk attendance marking
- Generate class-specific reports

#### Alerts & Notifications
- Set attendance thresholds
- Enable automated monitoring
- Configure alert frequencies
- Send parent notifications

## 🔧 Configuration

### Database
- SQLite database automatically created in `data/attendance.db`
- Automatic backups stored in `data/backups/`
- Database schema supports extended student information

### Settings
- **Late Threshold**: Default 09:00 AM
- **Alert Threshold**: Default 75% attendance
- **Check Frequency**: Default 30 minutes

## 📈 Advanced Features

### Analytics Capabilities
- **Individual Statistics**: Track each student's attendance percentage
- **Class Comparisons**: Compare attendance rates across classes
- **Trend Analysis**: Visual representation of attendance patterns
- **Date Range Filtering**: Analyze specific time periods

### Bulk Operations
- **CSV Templates**: Download templates for student import
- **Batch Processing**: Handle multiple students simultaneously
- **Class Management**: Operations specific to class sections
- **Data Export**: Comprehensive data export options

### Alert System
- **Low Attendance Alerts**: Automatic detection of students below threshold
- **Consecutive Absence Tracking**: Monitor students with multiple absences
- **Late Arrival Notifications**: Track and alert on late arrivals
- **Parent Communication**: Automated parent notification system

## 🔒 Data Security
- **Automatic Backups**: Regular database backups
- **Data Validation**: Input validation and error handling
- **Export Controls**: Secure data export options

## 🐛 Troubleshooting

### Common Issues
1. **Import Errors**: Ensure CSV files match the template format
2. **Chart Display**: Install matplotlib and pandas for analytics features
3. **Database Issues**: Check file permissions in the data directory

### Support
- Check the application logs for detailed error messages
- Ensure all dependencies are properly installed
- Verify database file permissions

## 🔄 Updates & Maintenance
- Regular database backups are automatically created
- Export data before major updates
- Monitor alert logs for system health

## 📝 License
This project is open source and available under the MIT License.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

