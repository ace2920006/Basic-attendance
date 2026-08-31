const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { sendFCMPushNotification } = require('../config/firebase');

// Dynamic getter for Socket.io to avoid circular dependencies
const getIO = () => {
  try {
    const { getIO: getSocketIO } = require('../config/socket');
    return getSocketIO();
  } catch (err) {
    return null;
  }
};

/**
 * Smart Attendance Advice Calculator
 * Calculates consecutive lectures needed to recover to target attendance threshold (e.g. 75%),
 * or safe miss buffer if currently above threshold.
 *
 * @param {Object} params
 * @param {number} params.currentPercentage - Current student attendance percentage
 * @param {number} params.minPercentage - Target threshold percentage (e.g. 75)
 * @param {number} params.attendedLectures - Total attended lectures
 * @param {number} params.totalLectures - Total conducted lectures
 * @param {string} params.subjectName - Name of the subject
 * @returns {Object} smartAdvice object
 */
const calculateSmartAttendanceAdvice = ({
  currentPercentage,
  minPercentage = 75,
  attendedLectures = 0,
  totalLectures = 0,
  subjectName = 'this subject'
}) => {
  const currPct = Math.round(Number(currentPercentage) || 0);
  const targetPct = Number(minPercentage) || 75;
  const attended = Number(attendedLectures) || 0;
  const total = Number(totalLectures) || 0;

  if (currPct < targetPct) {
    // Formula: (attended + x) / (total + x) >= targetPct / 100
    // => x * (1 - targetPct/100) >= (targetPct/100)*total - attended
    // => x = ceil( ((targetPct/100)*total - attended) / (1 - targetPct/100) )
    const targetFrac = targetPct / 100;
    const numerator = targetFrac * total - attended;
    const denominator = 1 - targetFrac;
    let lecturesNeeded = 1;

    if (denominator > 0 && numerator > 0) {
      lecturesNeeded = Math.ceil(numerator / denominator);
    }

    const actionableText = `Your ${subjectName} attendance has fallen to ${currPct}%. You need ${lecturesNeeded} consecutive attended ${lecturesNeeded === 1 ? 'lecture' : 'lectures'} to reach ${targetPct}%.`;

    return {
      isDefaulter: true,
      currentPercentage: currPct,
      targetPercentage: targetPct,
      lecturesNeeded,
      safeMisses: 0,
      attendedLectures: attended,
      totalLectures: total,
      actionableText
    };
  } else {
    // Student is safe: calculate how many lectures they can safely miss
    // Formula: attended / (total + y) >= targetPct / 100
    // => y <= (attended / (targetPct/100)) - total
    const targetFrac = targetPct / 100;
    let safeMisses = 0;
    if (targetFrac > 0) {
      safeMisses = Math.max(0, Math.floor(attended / targetFrac - total));
    }

    const actionableText = `Your ${subjectName} attendance is ${currPct}%. You can safely miss up to ${safeMisses} upcoming ${safeMisses === 1 ? 'lecture' : 'lectures'} while maintaining ${targetPct}%.`;

    return {
      isDefaulter: false,
      currentPercentage: currPct,
      targetPercentage: targetPct,
      lecturesNeeded: 0,
      safeMisses,
      attendedLectures: attended,
      totalLectures: total,
      actionableText
    };
  }
};

/**
 * Generate Responsive HTML Email Template for Multi-Channel Notifications
 */
const generateEmailTemplate = ({
  title,
  message,
  eventType = 'GENERAL',
  type = 'info',
  smartAdvice = null,
  recipientName = 'Student',
  details = {},
  actionUrl = null
}) => {
  const getBannerColor = () => {
    switch (type) {
      case 'success':
        return '#10b981'; // Emerald
      case 'warning':
        return '#f59e0b'; // Amber
      case 'error':
        return '#ef4444'; // Rose
      default:
        return '#6366f1'; // Indigo
    }
  };

  const accentColor = getBannerColor();

  let detailsHtml = '';
  if (details && Object.keys(details).length > 0) {
    const rows = Object.entries(details)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(
        ([k, v]) => `
        <tr>
          <td style="padding: 6px 12px; font-weight: 600; color: #94a3b8; text-transform: capitalize; border-bottom: 1px solid #1e293b; font-size: 13px;">${k.replace(/([A-Z])/g, ' $1')}</td>
          <td style="padding: 6px 12px; color: #f8fafc; border-bottom: 1px solid #1e293b; font-size: 13px;">${v}</td>
        </tr>`
      )
      .join('');

    if (rows) {
      detailsHtml = `
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #0f172a; border-radius: 8px; overflow: hidden; border: 1px solid #1e293b;">
          ${rows}
        </table>
      `;
    }
  }

  let smartAdviceHtml = '';
  if (smartAdvice && smartAdvice.actionableText) {
    smartAdviceHtml = `
      <div style="background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(245,158,11,0.1)); border: 1px solid #f59e0b; border-radius: 10px; padding: 14px 18px; margin: 18px 0;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
          <span style="color: #f59e0b; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">⚡ Smart Attendance Recommendation</span>
        </div>
        <p style="color: #fef08a; font-size: 14px; margin: 0; line-height: 1.5; font-weight: 500;">
          ${smartAdvice.actionableText}
        </p>
        ${
          smartAdvice.lecturesNeeded > 0
            ? `<div style="margin-top: 10px; font-size: 12px; color: #cbd5e1; background: #1e293b; display: inline-block; padding: 4px 10px; border-radius: 6px; border: 1px solid #334155;">
                Target: <strong>${smartAdvice.targetPercentage}%</strong> | Current: <strong>${smartAdvice.currentPercentage}%</strong> | Consecutive Required: <strong style="color: #f87171;">+${smartAdvice.lecturesNeeded} lectures</strong>
              </div>`
            : ''
        }
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #020617; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #020617; padding: 24px 0;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #0f172a; border-radius: 16px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
                <!-- Header Banner -->
                <tr>
                  <td style="padding: 24px; background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); border-bottom: 2px solid ${accentColor};">
                    <div style="font-size: 12px; font-weight: 700; color: ${accentColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
                      AttendPro Academic Notification
                    </div>
                    <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; line-height: 1.3;">
                      ${title}
                    </h1>
                  </td>
                </tr>

                <!-- Body Content -->
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #94a3b8; font-size: 14px; margin-top: 0; margin-bottom: 12px;">
                      Hello <strong style="color: #f8fafc;">${recipientName}</strong>,
                    </p>
                    <p style="color: #e2e8f0; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
                      ${message}
                    </p>

                    ${smartAdviceHtml}
                    ${detailsHtml}

                    ${
                      actionUrl
                        ? `
                      <div style="margin: 24px 0 12px; text-align: center;">
                        <a href="${actionUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
                          View in AttendPro Portal
                        </a>
                      </div>`
                        : ''
                    }
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 16px 24px; background-color: #020617; border-top: 1px solid #1e293b; text-align: center;">
                    <p style="color: #64748b; font-size: 11px; margin: 0; line-height: 1.4;">
                      This is an automated notification from the <strong>AttendPro System</strong>.<br />
                      You can manage your notification preferences anytime from your account settings.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

/**
 * Check if a specific event type is enabled by the user's notification preferences
 */
const isEventEnabledByUser = (user, eventType) => {
  if (!user || !user.notificationPreferences || !user.notificationPreferences.events) {
    return true; // default true
  }

  const prefs = user.notificationPreferences.events;
  switch (eventType) {
    case 'ATTENDANCE_MARKED':
      return prefs.attendanceMarked !== false;
    case 'LOW_ATTENDANCE':
      return prefs.lowAttendance !== false;
    case 'LEAVE_APPROVED':
    case 'LEAVE_REJECTED':
    case 'LEAVE_STATUS':
      return prefs.leaveStatus !== false;
    case 'ANNOUNCEMENT':
      return prefs.announcements !== false;
    case 'CLASS_CANCELLED':
      return prefs.classCancelled !== false;
    case 'TIMETABLE_CHANGED':
      return prefs.timetableChanged !== false;
    default:
      return true;
  }
};

/**
 * Core Multi-Channel Notification Dispatcher
 *
 * @param {Object} options
 * @param {string} [options.recipientId] - Target single User ID
 * @param {string} [options.role] - Broadcast to role ('student', 'teacher', 'admin')
 * @param {string} [options.department] - Broadcast to department
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message content
 * @param {string} [options.type='info'] - 'info' | 'warning' | 'success' | 'error'
 * @param {string} [options.eventType='GENERAL'] - Event type identifier
 * @param {Array<string>} [options.channels] - Explicit channels to send ['in_app', 'email', 'push']
 * @param {Object} [options.smartAdvice] - Structured smart advice payload
 * @param {Object} [options.data={}] - Additional metadata
 * @param {string} [options.emailHtml] - Custom HTML override for email
 * @returns {Promise<Array>} Array of created Notification records
 */
const dispatchNotification = async ({
  recipientId = null,
  role = null,
  department = null,
  title,
  message,
  type = 'info',
  eventType = 'GENERAL',
  channels = ['in_app', 'email', 'push'],
  smartAdvice = null,
  data = {},
  emailHtml = null
}) => {
  try {
    const io = getIO();
    const channelsSent = [];
    const savedNotifications = [];

    // ==========================================
    // CASE 1: TARGETED TO SPECIFIC USER
    // ==========================================
    if (recipientId) {
      const user = await User.findById(recipientId).select(
        'name email fcmTokens notificationPreferences'
      );

      if (!user) {
        console.warn(`[NotificationService] Target user ${recipientId} not found.`);
        return [];
      }

      // Check event level toggle
      const eventAllowed = isEventEnabledByUser(user, eventType);
      if (!eventAllowed) {
        console.log(`[NotificationService] Event ${eventType} muted by user ${recipientId} preferences.`);
        return [];
      }

      const userChannels = user.notificationPreferences?.channels || {
        inApp: true,
        email: true,
        push: true
      };

      const shouldSendInApp = channels.includes('in_app') && userChannels.inApp !== false;
      const shouldSendEmail = channels.includes('email') && userChannels.email !== false && Boolean(user.email);
      const shouldSendPush = channels.includes('push') && userChannels.push !== false;

      if (shouldSendInApp) channelsSent.push('in_app');
      if (shouldSendEmail) channelsSent.push('email');
      if (shouldSendPush) channelsSent.push('push');

      // 1. In-App Channel (DB Record + WebSocket)
      let notifDoc = null;
      if (shouldSendInApp) {
        notifDoc = await Notification.create({
          recipient: recipientId,
          title,
          message,
          type,
          eventType,
          channelsSent,
          smartAdvice: smartAdvice || undefined,
          data: { ...data, smartAdvice },
          unread: true
        });
        savedNotifications.push(notifDoc);

        if (io) {
          io.to(`user_${recipientId}`).emit('notification_received', notifDoc);
        }
      }

      // 2. Email Channel
      if (shouldSendEmail) {
        const htmlBody =
          emailHtml ||
          generateEmailTemplate({
            title,
            message,
            eventType,
            type,
            smartAdvice,
            recipientName: user.name || 'Student',
            details: data
          });

        sendEmail({
          email: user.email,
          subject: title,
          message,
          html: htmlBody
        }).catch((err) =>
          console.error(`[NotificationService] Email delivery failed to ${user.email}:`, err.message)
        );
      }

      // 3. Push Channel (FCM)
      if (shouldSendPush) {
        sendFCMPushNotification({
          recipientId,
          title,
          message,
          data: { ...data, eventType, smartAdvice: JSON.stringify(smartAdvice || {}) }
        }).catch((err) =>
          console.error(`[NotificationService] Push delivery failed to ${recipientId}:`, err.message)
        );
      }

      return savedNotifications;
    }

    // ==========================================
    // CASE 2: BROADCAST / ROLE / DEPARTMENT
    // ==========================================
    const userQuery = {};
    if (role && role !== 'all') userQuery.role = role;
    if (department) userQuery.department = department;

    const targetUsers = await User.find(userQuery).select(
      '_id name email fcmTokens notificationPreferences'
    );

    if (!targetUsers || targetUsers.length === 0) {
      return [];
    }

    // Batch In-App creation
    const inAppDocs = targetUsers.map((u) => ({
      recipient: u._id,
      title,
      message,
      type,
      eventType,
      channelsSent: ['in_app', 'email', 'push'],
      smartAdvice: smartAdvice || undefined,
      data,
      unread: true
    }));

    if (inAppDocs.length > 0) {
      const inserted = await Notification.insertMany(inAppDocs);
      savedNotifications.push(...inserted);
    }

    // Real-time Socket.io Room Emit
    if (io) {
      const socketPayload = {
        title,
        message,
        type,
        eventType,
        smartAdvice,
        data,
        createdAt: new Date()
      };

      if (role && !department) {
        io.to(`role_${role}`).emit('notification_received', socketPayload);
      } else if (department && !role) {
        const deptRoom = `dept_${department.toLowerCase().replace(/\s+/g, '_')}`;
        io.to(deptRoom).emit('notification_received', socketPayload);
      } else {
        io.emit('notification_received', socketPayload);
      }
    }

    // Asynchronous background email/push dispatch to broadcast list
    (async () => {
      for (const targetUser of targetUsers) {
        if (!isEventEnabledByUser(targetUser, eventType)) continue;

        const userChannels = targetUser.notificationPreferences?.channels || {
          inApp: true,
          email: true,
          push: true
        };

        if (channels.includes('email') && userChannels.email !== false && targetUser.email) {
          const htmlBody =
            emailHtml ||
            generateEmailTemplate({
              title,
              message,
              eventType,
              type,
              smartAdvice,
              recipientName: targetUser.name || 'Member',
              details: data
            });

          sendEmail({
            email: targetUser.email,
            subject: title,
            message,
            html: htmlBody
          }).catch(() => {});
        }

        if (channels.includes('push') && userChannels.push !== false && targetUser.fcmTokens?.length > 0) {
          sendFCMPushNotification({
            recipientId: targetUser._id,
            title,
            message,
            data: { ...data, eventType }
          }).catch(() => {});
        }
      }
    })().catch((err) => console.error('[NotificationService] Broadcast dispatch error:', err.message));

    return savedNotifications;
  } catch (error) {
    console.error('[NotificationService] Error dispatching notification:', error);
    return [];
  }
};

// =========================================================================
// DOMAIN-SPECIFIC EVENT DISPATCHERS
// =========================================================================

/**
 * Event 1: Attendance Marked
 */
const notifyAttendanceMarked = async ({
  studentId,
  subject,
  subjectCode = '',
  status,
  date = new Date(),
  timeSlot = ''
}) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const type =
    status === 'Present'
      ? 'success'
      : status === 'Late' || status === 'Excused'
      ? 'warning'
      : 'error';

  const title = `Attendance Marked: ${subject}`;
  const message = `You were marked ${status} for ${subject}${subjectCode ? ` (${subjectCode})` : ''} on ${formattedDate}${timeSlot ? ` [${timeSlot}]` : ''}.`;

  return await dispatchNotification({
    recipientId: studentId,
    title,
    message,
    type,
    eventType: 'ATTENDANCE_MARKED',
    data: {
      subject,
      subjectCode,
      status,
      date: formattedDate,
      timeSlot
    }
  });
};

/**
 * Event 2: Low Attendance (with Smart Notification Advice)
 */
const notifyLowAttendance = async ({
  studentId,
  subject,
  subjectCode = '',
  currentPercentage,
  minPercentage = 75,
  attendedLectures = 0,
  totalLectures = 0
}) => {
  const smartAdvice = calculateSmartAttendanceAdvice({
    currentPercentage,
    minPercentage,
    attendedLectures,
    totalLectures,
    subjectName: subject
  });

  const title = `⚠️ Low Attendance Warning: ${subject}`;
  const message = smartAdvice.actionableText;

  return await dispatchNotification({
    recipientId: studentId,
    title,
    message,
    type: 'warning',
    eventType: 'LOW_ATTENDANCE',
    smartAdvice,
    data: {
      subject,
      subjectCode,
      currentPercentage: smartAdvice.currentPercentage,
      minRequired: minPercentage,
      lecturesNeeded: smartAdvice.lecturesNeeded,
      totalLectures,
      attendedLectures
    }
  });
};

/**
 * Event 3: Leave Approved
 */
const notifyLeaveApproved = async ({
  studentId,
  leaveType = 'Medical',
  startDate,
  endDate,
  remarks = '',
  reviewerName = 'Faculty Reviewer'
}) => {
  const dateStr = startDate === endDate ? startDate : `${startDate} to ${endDate}`;
  const title = `Leave Request Approved ✅`;
  const message = `Your ${leaveType} leave application for ${dateStr} has been approved by ${reviewerName}.${remarks ? ` Remarks: ${remarks}` : ''}`;

  return await dispatchNotification({
    recipientId: studentId,
    title,
    message,
    type: 'success',
    eventType: 'LEAVE_APPROVED',
    data: {
      leaveType,
      duration: dateStr,
      status: 'Approved',
      approvedBy: reviewerName,
      remarks
    }
  });
};

/**
 * Event 4: Leave Rejected
 */
const notifyLeaveRejected = async ({
  studentId,
  leaveType = 'Medical',
  startDate,
  endDate,
  remarks = '',
  reviewerName = 'Faculty Reviewer'
}) => {
  const dateStr = startDate === endDate ? startDate : `${startDate} to ${endDate}`;
  const title = `Leave Request Rejected ❌`;
  const message = `Your ${leaveType} leave application for ${dateStr} has been rejected by ${reviewerName}.${remarks ? ` Reason: ${remarks}` : ''}`;

  return await dispatchNotification({
    recipientId: studentId,
    title,
    message,
    type: 'error',
    eventType: 'LEAVE_REJECTED',
    data: {
      leaveType,
      duration: dateStr,
      status: 'Rejected',
      rejectedBy: reviewerName,
      remarks
    }
  });
};

/**
 * Event 5: New Announcement
 */
const notifyAnnouncement = async ({
  title,
  message,
  targetRole = 'all',
  department = null,
  authorName = 'Campus Administration',
  type = 'info'
}) => {
  const formattedTitle = `📢 Announcement: ${title}`;
  const formattedMessage = `${message} — Published by ${authorName}`;

  return await dispatchNotification({
    recipientId: null,
    role: targetRole === 'all' ? null : targetRole,
    department: department || null,
    title: formattedTitle,
    message: formattedMessage,
    type,
    eventType: 'ANNOUNCEMENT',
    data: {
      title,
      postedBy: authorName,
      targetRole,
      department: department || 'All Departments'
    }
  });
};

/**
 * Event 6: Class Cancelled
 */
const notifyClassCancelled = async ({
  department,
  course = '',
  subject,
  subjectCode = '',
  room = '',
  timeSlot = '',
  date = new Date(),
  reason = 'Instructor Unavailable'
}) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const title = `🚨 Class Cancelled: ${subject}`;
  const message = `Notice: ${subject}${subjectCode ? ` (${subjectCode})` : ''} scheduled on ${formattedDate} (${timeSlot || 'Scheduled Session'}) in ${room || 'Classroom'} has been cancelled. Reason: ${reason}.`;

  return await dispatchNotification({
    recipientId: null,
    role: 'student',
    department: department || null,
    title,
    message,
    type: 'warning',
    eventType: 'CLASS_CANCELLED',
    data: {
      subject,
      subjectCode,
      room,
      timeSlot,
      date: formattedDate,
      reason,
      department
    }
  });
};

/**
 * Event 7: Timetable Changed
 */
const notifyTimetableChanged = async ({
  department,
  course = '',
  semester = '',
  section = '',
  subject,
  changeType = 'Updated', // 'Created' | 'Updated' | 'Rescheduled' | 'Deleted'
  slotDetails = {}
}) => {
  const { day, timeSlot, room, instructor } = slotDetails;
  const title = `📅 Timetable ${changeType}: ${subject}`;
  const message = `The timetable for ${subject} (${day || 'Upcoming'}, ${timeSlot || 'New slot'}) in ${room || 'Assigned Room'} has been ${changeType.toLowerCase()}${instructor ? ` with ${instructor}` : ''}.`;

  return await dispatchNotification({
    recipientId: null,
    role: 'student',
    department: department || null,
    title,
    message,
    type: 'info',
    eventType: 'TIMETABLE_CHANGED',
    data: {
      subject,
      changeType,
      day,
      timeSlot,
      room,
      instructor,
      department,
      semester,
      section
    }
  });
};

module.exports = {
  dispatchNotification,
  calculateSmartAttendanceAdvice,
  generateEmailTemplate,
  notifyAttendanceMarked,
  notifyLowAttendance,
  notifyLeaveApproved,
  notifyLeaveRejected,
  notifyAnnouncement,
  notifyClassCancelled,
  notifyTimetableChanged
};
