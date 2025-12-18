import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationType } from '../enums/notification-type.enum';

/**
 * Recruitment Notifications Service
 *
 * This service handles all recruitment-related notifications including:
 * - Interview notifications (scheduled, cancelled, rescheduled, completed)
 * - Application notifications (new applications, acceptance, rejection)
 * - Hiring notifications (candidate hired, rejected)
 * - Offer notifications (offer received, accepted, rejected)
 * - Onboarding notifications (welcome, task reminders, document uploads, access provisioning, equipment reservation, completion)
 * - Payroll integration notifications (new hire ready, signing bonus)
 *
 * This service is part of the recruitment subsystem and is called by the main NotificationsService.
 */
@Injectable()
export class RecruitmentNotificationsService {
  constructor(
    @InjectModel('ExtendedNotification')
    private notificationLogModel: Model<any>
  ) {}

  // ===== RECRUITMENT SUBSYSTEM =====
  // Interview notifications

  // Notify panel members when assigned to an interview
  async notifyInterviewPanelMembers(
    panelMemberIds: string[],
    interviewDetails: {
      interviewId: string;
      candidateName: string;
      positionTitle: string;
      scheduledDate: Date;
      method: string;
      videoLink?: string;
      stage: string;
    }
  ) {
    if (!panelMemberIds || panelMemberIds.length === 0) {
      console.log('[INTERVIEW_NOTIFICATION] No panel members to notify');
      return { success: true, notificationsCreated: 0 };
    }

    const notifications: any[] = [];
    const formattedDate = interviewDetails.scheduledDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const methodText = interviewDetails.method || 'TBD';
    const videoLinkText = interviewDetails.videoLink
      ? `\nVideo Link: ${interviewDetails.videoLink}`
      : '';

    for (const panelMemberId of panelMemberIds) {
      try {
        const message =
          `You have been assigned as an interview panel member.\n\n` +
          `📋 Interview Details:\n` +
          `• Candidate: ${interviewDetails.candidateName}\n` +
          `• Position: ${interviewDetails.positionTitle}\n` +
          `• Stage: ${interviewDetails.stage}\n` +
          `• Date & Time: ${formattedDate}\n` +
          `• Method: ${methodText}${videoLinkText}\n\n` +
          `Please review the candidate's profile and prepare for the interview.`;

        const notification = await this.notificationLogModel.create({
          to: new Types.ObjectId(panelMemberId),
          type: NotificationType.INTERVIEW_PANEL_INVITATION,
          message: message,
          data: {
            interviewId: interviewDetails.interviewId,
            candidateName: interviewDetails.candidateName,
            positionTitle: interviewDetails.positionTitle,
            scheduledDate: interviewDetails.scheduledDate.toISOString(),
            method: interviewDetails.method,
            videoLink: interviewDetails.videoLink,
            stage: interviewDetails.stage,
          },
          isRead: false,
        });

        notifications.push(notification);
        console.log(`[INTERVIEW_NOTIFICATION] Sent notification to panel member: ${panelMemberId}`);
      } catch (error) {
        console.error(
          `[INTERVIEW_NOTIFICATION] Failed to notify panel member ${panelMemberId}:`,
          error
        );
      }
    }

    console.log(
      `[INTERVIEW_NOTIFICATION] Successfully created ${notifications.length} notifications for panel members`
    );

    return {
      success: true,
      notificationsCreated: notifications.length,
      notifications,
    };
  }

  // Notify HR staff when a candidate submits a new application
  async notifyHRNewApplication(
    hrRecipientIds: string[],
    applicationDetails: {
      applicationId: string;
      candidateName: string;
      positionTitle: string;
      requisitionId: string;
      isReferral?: boolean;
    }
  ) {
    if (!hrRecipientIds || hrRecipientIds.length === 0) {
      console.log('[APPLICATION_NOTIFICATION] No HR recipients to notify');
      return { success: true, notificationsCreated: 0 };
    }

    const notifications: any[] = [];
    const referralBadge = applicationDetails.isReferral ? '⭐ REFERRAL - ' : '';
    const internalBadge = (applicationDetails as any).isInternalCandidate
      ? '👤 INTERNAL CANDIDATE - '
      : '';
    const appliedAt = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const screeningInfo =
      (applicationDetails as any).screeningScore !== undefined
        ? `\n📊 Electronic Screening:\n` +
          `• Score: ${(applicationDetails as any).screeningScore}/100\n` +
          `• Status: ${(applicationDetails as any).screeningPassed ? '✓ Passed' : '⚠ Needs Review'}\n`
        : '';

    for (const recipientId of hrRecipientIds) {
      try {
        const message =
          `${internalBadge}${referralBadge}New job application received!\n\n` +
          `📋 Application Details:\n` +
          `• Candidate: ${applicationDetails.candidateName}\n` +
          `• Position: ${applicationDetails.positionTitle}\n` +
          `• Applied: ${appliedAt}${screeningInfo}\n\n` +
          `Please review the application and schedule screening.`;

        const notification = await this.notificationLogModel.create({
          to: new Types.ObjectId(recipientId),
          type: NotificationType.NEW_APPLICATION_RECEIVED,
          message: message,
          data: {
            applicationId: applicationDetails.applicationId,
            candidateName: applicationDetails.candidateName,
            positionTitle: applicationDetails.positionTitle,
            requisitionId: applicationDetails.requisitionId,
            isReferral: applicationDetails.isReferral || false,
          },
          isRead: false,
        });

        notifications.push(notification);
        console.log(`[APPLICATION_NOTIFICATION] Sent notification to HR: ${recipientId}`);
      } catch (error) {
        console.error(`[APPLICATION_NOTIFICATION] Failed to notify HR ${recipientId}:`, error);
      }
    }

    console.log(
      `[APPLICATION_NOTIFICATION] Successfully created ${notifications.length} notifications for HR staff`
    );

    return {
      success: true,
      notificationsCreated: notifications.length,
      notifications,
    };
  }

  // Notify panel members when an interview is cancelled
  async notifyInterviewCancelled(
    panelMemberIds: string[],
    interviewDetails: {
      candidateName: string;
      positionTitle: string;
      originalDate: Date;
    }
  ) {
    if (!panelMemberIds || panelMemberIds.length === 0) {
      return { success: true, notificationsCreated: 0 };
    }

    const notifications: any[] = [];
    const formattedDate = interviewDetails.originalDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    for (const panelMemberId of panelMemberIds) {
      try {
        const message =
          `An interview you were assigned to has been cancelled.\n\n` +
          `• Candidate: ${interviewDetails.candidateName}\n` +
          `• Position: ${interviewDetails.positionTitle}\n` +
          `• Originally Scheduled: ${formattedDate}`;

        const notification = await this.notificationLogModel.create({
          to: new Types.ObjectId(panelMemberId),
          type: NotificationType.INTERVIEW_CANCELLED,
          message: message,
          isRead: false,
        });

        notifications.push(notification);
      } catch (error) {
        console.error(
          `[INTERVIEW_NOTIFICATION] Failed to notify panel member ${panelMemberId} about cancellation:`,
          error
        );
      }
    }

    return {
      success: true,
      notificationsCreated: notifications.length,
    };
  }

  // Notify panel members when an interview is rescheduled
  async notifyInterviewRescheduled(
    panelMemberIds: string[],
    interviewDetails: {
      interviewId: string;
      candidateName: string;
      positionTitle: string;
      oldDate: Date;
      newDate: Date;
      method: string;
      videoLink?: string;
    }
  ) {
    if (!panelMemberIds || panelMemberIds.length === 0) {
      return { success: true, notificationsCreated: 0 };
    }

    const notifications: any[] = [];
    const oldFormattedDate = interviewDetails.oldDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const newFormattedDate = interviewDetails.newDate.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    for (const panelMemberId of panelMemberIds) {
      try {
        const message =
          `An interview you are assigned to has been rescheduled.\n\n` +
          `• Candidate: ${interviewDetails.candidateName}\n` +
          `• Position: ${interviewDetails.positionTitle}\n` +
          `• Previous Date: ${oldFormattedDate}\n` +
          `• New Date: ${newFormattedDate}\n` +
          `• Method: ${interviewDetails.method}` +
          (interviewDetails.videoLink ? `\n• Video Link: ${interviewDetails.videoLink}` : '');

        const notification = await this.notificationLogModel.create({
          to: new Types.ObjectId(panelMemberId),
          type: NotificationType.INTERVIEW_RESCHEDULED,
          message: message,
          data: {
            interviewId: interviewDetails.interviewId,
            candidateName: interviewDetails.candidateName,
            positionTitle: interviewDetails.positionTitle,
            oldDate: interviewDetails.oldDate.toISOString(),
            newDate: interviewDetails.newDate.toISOString(),
            method: interviewDetails.method,
            videoLink: interviewDetails.videoLink,
          },
          isRead: false,
        });

        notifications.push(notification);
      } catch (error) {
        console.error(
          `[INTERVIEW_NOTIFICATION] Failed to notify panel member ${panelMemberId} about reschedule:`,
          error
        );
      }
    }

    return {
      success: true,
      notificationsCreated: notifications.length,
    };
  }

  // Get all interview notifications for a user
  async getInterviewNotifications(userId: string) {
    const notifications = await this.notificationLogModel
      .find({
        to: new Types.ObjectId(userId),
        type: {
          $in: [
            NotificationType.INTERVIEW_PANEL_INVITATION,
            NotificationType.INTERVIEW_SCHEDULED,
            NotificationType.INTERVIEW_CANCELLED,
            NotificationType.INTERVIEW_RESCHEDULED,
          ],
        },
      })
      .sort({ createdAt: -1 })
      .exec();

    return {
      count: notifications.length,
      notifications,
    };
  }

  // Notify candidate when their interview is scheduled
  async notifyCandidateInterviewScheduled(
    candidateId: string,
    interviewDetails: {
      interviewId: string;
      positionTitle: string;
      scheduledDate: Date;
      method: string;
      videoLink?: string;
      stage: string;
    }
  ) {
    if (!candidateId) {
      console.log('[INTERVIEW_NOTIFICATION] No candidate ID provided');
      return { success: false, message: 'No candidate ID provided' };
    }

    try {
      const formattedDate = interviewDetails.scheduledDate.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const methodText = interviewDetails.method || 'TBD';
      const videoLinkText = interviewDetails.videoLink
        ? `\n• Video Link: ${interviewDetails.videoLink}`
        : '';

      const message =
        `🎉 Great news! Your interview has been scheduled.\n\n` +
        `📋 Interview Details:\n` +
        `• Position: ${interviewDetails.positionTitle}\n` +
        `• Stage: ${interviewDetails.stage}\n` +
        `• Date & Time: ${formattedDate}\n` +
        `• Method: ${methodText}${videoLinkText}\n\n` +
        `Please make sure to be available at the scheduled time. Good luck!`;

      const notification = await this.notificationLogModel.create({
        to: new Types.ObjectId(candidateId),
        type: NotificationType.INTERVIEW_SCHEDULED,
        message: message,
        data: {
          interviewId: interviewDetails.interviewId,
          positionTitle: interviewDetails.positionTitle,
          scheduledDate: interviewDetails.scheduledDate.toISOString(),
          method: interviewDetails.method,
          videoLink: interviewDetails.videoLink,
          stage: interviewDetails.stage,
        },
        isRead: false,
      });

      console.log(
        `[INTERVIEW_NOTIFICATION] Sent interview scheduled notification to candidate: ${candidateId}`
      );

      return {
        success: true,
        notification,
      };
    } catch (error) {
      console.error(`[INTERVIEW_NOTIFICATION] Failed to notify candidate ${candidateId}:`, error);
      return { success: false, error };
    }
  }

  // Notify HR employees when a candidate is hired
  async notifyHREmployeesCandidateHired(
    hrEmployeeIds: string[],
    hiringDetails: {
      candidateName: string;
      candidateId: string;
      positionTitle: string;
      applicationId: string;
      offerId?: string;
    }
  ) {
    if (!hrEmployeeIds || hrEmployeeIds.length === 0) {
      console.log('[HIRING_NOTIFICATION] No HR Employees to notify about hiring');
      return { success: true, notificationsCreated: 0 };
    }

    const notifications: any[] = [];

    for (const hrEmployeeId of hrEmployeeIds) {
      try {
        const message =
          `🎉 A candidate has been HIRED!\n\n` +
          `📋 Hiring Details:\n` +
          `• Candidate: ${hiringDetails.candidateName}\n` +
          `• Position: ${hiringDetails.positionTitle}\n\n` +
          `Next Steps:\n` +
          `• Send the acceptance letter to the candidate\n` +
          `• Prepare onboarding documents\n` +
          `• Track the candidate in "Candidate Tracking"`;

        const notification = await this.notificationLogModel.create({
          to: new Types.ObjectId(hrEmployeeId),
          type: NotificationType.CANDIDATE_HIRED,
          message: message,
          data: {
            candidateName: hiringDetails.candidateName,
            candidateId: hiringDetails.candidateId,
            positionTitle: hiringDetails.positionTitle,
            applicationId: hiringDetails.applicationId,
            offerId: hiringDetails.offerId,
            action: 'HIRED',
          },
          isRead: false,
        });

        notifications.push(notification);
        console.log(
          `[HIRING_NOTIFICATION] Sent HIRED notification to HR Employee: ${hrEmployeeId}`
        );
      } catch (error) {
        console.error(`[HIRING_NOTIFICATION] Failed to notify HR Employee ${hrEmployeeId}:`, error);
      }
    }

    return {
      success: true,
      notificationsCreated: notifications.length,
    };
  }

  // Notify HR employees when a candidate is rejected
  async notifyHREmployeesCandidateRejected(
    hrEmployeeIds: string[],
    rejectionDetails: {
      candidateName: string;
      candidateId: string;
      positionTitle: string;
      applicationId: string;
      rejectionReason?: string;
    }
  ) {
    if (!hrEmployeeIds || hrEmployeeIds.length === 0) {
      console.log('[HIRING_NOTIFICATION] No HR Employees to notify about rejection');
      return { success: true, notificationsCreated: 0 };
    }

    const notifications: any[] = [];

    for (const hrEmployeeId of hrEmployeeIds) {
      try {
        const message =
          `❌ A candidate has been REJECTED.\n\n` +
          `📋 Details:\n` +
          `• Candidate: ${rejectionDetails.candidateName}\n` +
          `• Position: ${rejectionDetails.positionTitle}\n` +
          (rejectionDetails.rejectionReason
            ? `• Reason: ${rejectionDetails.rejectionReason}\n`
            : '') +
          `\nThe rejection notification has been sent to the candidate.`;

        const notification = await this.notificationLogModel.create({
          to: new Types.ObjectId(hrEmployeeId),
          type: NotificationType.CANDIDATE_REJECTED,
          message: message,
          data: {
            candidateName: rejectionDetails.candidateName,
            candidateId: rejectionDetails.candidateId,
            positionTitle: rejectionDetails.positionTitle,
            applicationId: rejectionDetails.applicationId,
            rejectionReason: rejectionDetails.rejectionReason,
            action: 'REJECTED',
          },
          isRead: false,
        });

        notifications.push(notification);
        console.log(
          `[HIRING_NOTIFICATION] Sent REJECTED notification to HR Employee: ${hrEmployeeId}`
        );
      } catch (error) {
        console.error(`[HIRING_NOTIFICATION] Failed to notify HR Employee ${hrEmployeeId}:`, error);
      }
    }

    return {
      success: true,
      notificationsCreated: notifications.length,
    };
  }

  // Notify candidate when they are hired
  async notifyCandidateAccepted(
    candidateId: string,
    acceptanceDetails: {
      positionTitle: string;
      applicationId: string;
    }
  ) {
    if (!candidateId) {
      return { success: false, message: 'No candidate ID provided' };
    }

    try {
      const message =
        `🎉 Congratulations! You have been HIRED!\n\n` +
        `We are delighted to inform you that your application for ${acceptanceDetails.positionTitle} has been successful.\n\n` +
        `You will receive your official acceptance letter and onboarding details shortly.\n\n` +
        `Welcome to the team!`;

      const notification = await this.notificationLogModel.create({
        to: new Types.ObjectId(candidateId),
        type: NotificationType.APPLICATION_ACCEPTED,
        message: message,
        data: {
          positionTitle: acceptanceDetails.positionTitle,
          applicationId: acceptanceDetails.applicationId,
          action: 'ACCEPTED',
        },
        isRead: false,
      });

      console.log(`[HIRING_NOTIFICATION] Sent ACCEPTED notification to candidate: ${candidateId}`);

      return {
        success: true,
        notification,
      };
    } catch (error) {
      console.error(`[HIRING_NOTIFICATION] Failed to notify candidate ${candidateId}:`, error);
      return { success: false, error };
    }
  }

  // Notify candidate when their application is rejected
  async notifyCandidateRejected(
    candidateId: string,
    rejectionDetails: {
      positionTitle: string;
      applicationId: string;
      rejectionReason?: string;
    }
  ) {
    if (!candidateId) {
      return { success: false, message: 'No candidate ID provided' };
    }

    try {
      let message =
        `Thank you for your interest in the ${rejectionDetails.positionTitle} position.\n\n` +
        `After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.\n\n`;

      if (rejectionDetails.rejectionReason) {
        message += `Feedback: ${rejectionDetails.rejectionReason}\n\n`;
      }

      message += `We appreciate the time you invested in the application process and wish you the best in your job search.`;

      const notification = await this.notificationLogModel.create({
        to: new Types.ObjectId(candidateId),
        type: NotificationType.APPLICATION_REJECTED,
        message: message,
        data: {
          positionTitle: rejectionDetails.positionTitle,
          applicationId: rejectionDetails.applicationId,
          rejectionReason: rejectionDetails.rejectionReason,
          action: 'REJECTED',
        },
        isRead: false,
      });

      console.log(`[HIRING_NOTIFICATION] Sent REJECTED notification to candidate: ${candidateId}`);

      return {
        success: true,
        notification,
      };
    } catch (error) {
      console.error(`[HIRING_NOTIFICATION] Failed to notify candidate ${candidateId}:`, error);
      return { success: false, error };
    }
  }

  // Notify candidate when interview is completed (all feedback submitted)
  async notifyCandidateInterviewCompleted(
    candidateId: string,
    interviewDetails: {
      positionTitle: string;
      applicationId: string;
      interviewId: string;
    }
  ) {
    if (!candidateId) {
      return { success: false, message: 'No candidate ID provided' };
    }

    try {
      const message =
        `✅ Your interview has been completed.\n\n` +
        `We have received all feedback from the interview panel for the ${interviewDetails.positionTitle} position.\n\n` +
        `Our team is now reviewing the feedback and will notify you of our decision soon.\n\n` +
        `Thank you for your patience!`;

      const notification = await this.notificationLogModel.create({
        to: new Types.ObjectId(candidateId),
        type: NotificationType.INTERVIEW_COMPLETED,
        message: message,
        data: {
          positionTitle: interviewDetails.positionTitle,
          applicationId: interviewDetails.applicationId,
          interviewId: interviewDetails.interviewId,
          action: 'INTERVIEW_COMPLETED',
        },
        isRead: false,
      });

      console.log(
        `[INTERVIEW_NOTIFICATION] Sent INTERVIEW_COMPLETED notification to candidate: ${candidateId}`
      );

      return {
        success: true,
        notification,
      };
    } catch (error) {
      console.error(`[INTERVIEW_NOTIFICATION] Failed to notify candidate ${candidateId}:`, error);
      return { success: false, error };
    }
  }

  // Notify HR manager when all interview feedback is submitted and ready for review
  async notifyHRManagerFeedbackReady(
    hrManagerIds: string[],
    reviewDetails: {
      candidateName: string;
      positionTitle: string;
      applicationId: string;
      interviewId: string;
    }
  ) {
    if (!hrManagerIds || hrManagerIds.length === 0) {
      console.log('[FEEDBACK_NOTIFICATION] No HR Managers to notify about ready feedback');
      return { success: true, notificationsCreated: 0 };
    }

    const notifications: any[] = [];

    for (const hrManagerId of hrManagerIds) {
      try {
        const message =
          `📋 An application is ready for review.\n\n` +
          `All interview feedback has been submitted for:\n` +
          `• Candidate: ${reviewDetails.candidateName}\n` +
          `• Position: ${reviewDetails.positionTitle}\n\n` +
          `Please review the feedback and make a decision (accept/reject).\n\n` +
          `You can view the application and feedback in the "Job Offers & Approvals" page.`;

        const notification = await this.notificationLogModel.create({
          to: new Types.ObjectId(hrManagerId),
          type: NotificationType.FEEDBACK_READY_FOR_REVIEW,
          message: message,
          data: {
            candidateName: reviewDetails.candidateName,
            positionTitle: reviewDetails.positionTitle,
            applicationId: reviewDetails.applicationId,
            interviewId: reviewDetails.interviewId,
            action: 'FEEDBACK_READY',
          },
          isRead: false,
        });

        notifications.push(notification);
        console.log(
          `[FEEDBACK_NOTIFICATION] Sent FEEDBACK_READY notification to HR Manager: ${hrManagerId}`
        );
      } catch (error) {
        console.error(`[FEEDBACK_NOTIFICATION] Failed to notify HR Manager ${hrManagerId}:`, error);
      }
    }

    return {
      success: true,
      notificationsCreated: notifications.length,
    };
  }

  // Notify candidate when they receive a job offer
  async notifyCandidateOfferReceived(
    candidateId: string,
    offerDetails: {
      offerId: string;
      positionTitle: string;
      grossSalary: number;
      deadline: Date;
    }
  ) {
    if (!candidateId) {
      console.log('[OFFER_NOTIFICATION] No candidate ID provided');
      return { success: false, message: 'No candidate ID provided' };
    }

    try {
      const formattedDeadline = offerDetails.deadline.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const formattedSalary = offerDetails.grossSalary.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      });

      const message =
        `🎉 Great news! You have received a job offer!\n\n` +
        `📋 Offer Details:\n` +
        `• Position: ${offerDetails.positionTitle}\n` +
        `• Salary: ${formattedSalary}\n` +
        `• Response Deadline: ${formattedDeadline}\n\n` +
        `Please review the full offer details and respond before the deadline.\n` +
        `Go to "Job Offers" in your dashboard to view and respond.`;

      const notification = await this.notificationLogModel.create({
        to: new Types.ObjectId(candidateId),
        type: NotificationType.OFFER_RECEIVED,
        message: message,
        data: {
          offerId: offerDetails.offerId,
          positionTitle: offerDetails.positionTitle,
          grossSalary: offerDetails.grossSalary,
          deadline: offerDetails.deadline.toISOString(),
          action: 'OFFER_RECEIVED',
        },
        isRead: false,
      });

      console.log(
        `[OFFER_NOTIFICATION] Sent OFFER_RECEIVED notification to candidate: ${candidateId}`
      );

      return {
        success: true,
        notification,
      };
    } catch (error) {
      console.error(`[OFFER_NOTIFICATION] Failed to notify candidate ${candidateId}:`, error);
      return { success: false, error };
    }
  }

  // Notify HR when candidate accepts or rejects an offer
  async notifyHROfferResponse(
    hrUserIds: string[],
    responseDetails: {
      candidateName: string;
      candidateId: string;
      positionTitle: string;
      offerId: string;
      applicationId: string;
      response: 'accepted' | 'rejected';
    }
  ) {
    if (!hrUserIds || hrUserIds.length === 0) {
      console.log('[OFFER_NOTIFICATION] No HR users to notify about offer response');
      return { success: true, notificationsCreated: 0 };
    }

    const notifications: any[] = [];
    const isAccepted = responseDetails.response === 'accepted';
    const notificationType = isAccepted
      ? NotificationType.OFFER_RESPONSE_ACCEPTED
      : NotificationType.OFFER_RESPONSE_REJECTED;

    for (const hrUserId of hrUserIds) {
      try {
        let message: string;

        if (isAccepted) {
          message =
            `✅ ${responseDetails.candidateName} has ACCEPTED the job offer!\n\n` +
            `📋 Details:\n` +
            `• Position: ${responseDetails.positionTitle}\n\n` +
            `Next Steps:\n` +
            `• Review and finalize the offer in "Job Offers & Approvals"\n` +
            `• Once finalized, the candidate will be marked as HIRED\n` +
            `• Prepare onboarding documentation`;
        } else {
          message =
            `❌ ${responseDetails.candidateName} has REJECTED the job offer.\n\n` +
            `📋 Details:\n` +
            `• Position: ${responseDetails.positionTitle}\n\n` +
            `The application status will be updated accordingly.\n` +
            `Consider other candidates for this position.`;
        }

        const notification = await this.notificationLogModel.create({
          to: new Types.ObjectId(hrUserId),
          type: notificationType,
          message: message,
          data: {
            candidateName: responseDetails.candidateName,
            candidateId: responseDetails.candidateId,
            positionTitle: responseDetails.positionTitle,
            offerId: responseDetails.offerId,
            applicationId: responseDetails.applicationId,
            response: responseDetails.response,
            action: isAccepted ? 'OFFER_ACCEPTED' : 'OFFER_REJECTED',
          },
          isRead: false,
        });

        notifications.push(notification);
        console.log(
          `[OFFER_NOTIFICATION] Sent ${responseDetails.response.toUpperCase()} notification to HR: ${hrUserId}`
        );
      } catch (error) {
        console.error(`[OFFER_NOTIFICATION] Failed to notify HR user ${hrUserId}:`, error);
      }
    }

    return {
      success: true,
      notificationsCreated: notifications.length,
    };
  }

  // ===== ONBOARDING → PAYROLL INTEGRATION NOTIFICATIONS =====
  // ONB-018: Notify Payroll Team about New Hire Ready for Payroll
  async notifyPayrollTeamNewHire(
    payrollTeamIds: string[],
    newHireDetails: {
      employeeId: string;
      employeeName: string;
      employeeNumber?: string;
      positionTitle: string;
      departmentName?: string;
      grossSalary: number;
      contractStartDate: Date;
      signingBonus?: number;
    }
  ) {
    if (!payrollTeamIds || payrollTeamIds.length === 0) {
      console.log('[PAYROLL_NOTIFICATION] No payroll team members to notify');
      return { success: true, notificationsCreated: 0 };
    }

    const notifications: any[] = [];
    const formattedStartDate = newHireDetails.contractStartDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedSalary = newHireDetails.grossSalary.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });

    for (const payrollUserId of payrollTeamIds) {
      try {
        let message =
          `📋 New Hire Ready for Payroll (ONB-018)\n\n` +
          `A new employee has been onboarded and is ready for payroll inclusion.\n\n` +
          `👤 Employee Details:\n` +
          `• Name: ${newHireDetails.employeeName}\n` +
          (newHireDetails.employeeNumber
            ? `• Employee #: ${newHireDetails.employeeNumber}\n`
            : '') +
          `• Position: ${newHireDetails.positionTitle}\n` +
          (newHireDetails.departmentName
            ? `• Department: ${newHireDetails.departmentName}\n`
            : '') +
          `• Start Date: ${formattedStartDate}\n` +
          `• Gross Salary: ${formattedSalary}\n`;

        if (newHireDetails.signingBonus && newHireDetails.signingBonus > 0) {
          const formattedBonus = newHireDetails.signingBonus.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
          });
          message += `• Signing Bonus: ${formattedBonus} (pending review)\n`;
        }

        message +=
          `\n📌 Action Required:\n` +
          `• Employee will be automatically included in the next payroll run\n` +
          `• Verify salary and benefits configuration\n` +
          `• Review any pending signing bonuses`;

        const notification = await this.notificationLogModel.create({
          to: new Types.ObjectId(payrollUserId),
          type: NotificationType.NEW_HIRE_PAYROLL_READY,
          message: message,
          data: {
            employeeId: newHireDetails.employeeId,
            employeeName: newHireDetails.employeeName,
            employeeNumber: newHireDetails.employeeNumber,
            positionTitle: newHireDetails.positionTitle,
            departmentName: newHireDetails.departmentName,
            grossSalary: newHireDetails.grossSalary,
            contractStartDate: newHireDetails.contractStartDate.toISOString(),
            signingBonus: newHireDetails.signingBonus,
            action: 'NEW_HIRE_PAYROLL_READY',
          },
          isRead: false,
        });

        notifications.push(notification);
        console.log(`[PAYROLL_NOTIFICATION] Sent NEW_HIRE_PAYROLL_READY to: ${payrollUserId}`);
      } catch (error) {
        console.error(
          `[PAYROLL_NOTIFICATION] Failed to notify payroll user ${payrollUserId}:`,
          error
        );
      }
    }

    console.log(
      `[PAYROLL_NOTIFICATION] Created ${notifications.length} notifications for payroll team (ONB-018)`
    );

    return {
      success: true,
      notificationsCreated: notifications.length,
      notifications,
    };
  }

  // ONB-019: Notify Payroll Team about Signing Bonus Pending Review
  async notifyPayrollTeamSigningBonus(
    payrollTeamIds: string[],
    bonusDetails: {
      employeeId: string;
      employeeName: string;
      employeeNumber?: string;
      positionTitle: string;
      signingBonusAmount: number;
      signingBonusId?: string;
      paymentDate: Date;
    }
  ) {
    if (!payrollTeamIds || payrollTeamIds.length === 0) {
      console.log('[PAYROLL_NOTIFICATION] No payroll team members to notify about signing bonus');
      return { success: true, notificationsCreated: 0 };
    }

    const notifications: any[] = [];
    const formattedPaymentDate = bonusDetails.paymentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const formattedBonus = bonusDetails.signingBonusAmount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });

    for (const payrollUserId of payrollTeamIds) {
      try {
        const message =
          `🎁 Signing Bonus Pending Review (ONB-019)\n\n` +
          `A signing bonus has been created for a new hire and requires your review.\n\n` +
          `👤 Employee Details:\n` +
          `• Name: ${bonusDetails.employeeName}\n` +
          (bonusDetails.employeeNumber ? `• Employee #: ${bonusDetails.employeeNumber}\n` : '') +
          `• Position: ${bonusDetails.positionTitle}\n\n` +
          `💰 Bonus Details:\n` +
          `• Amount: ${formattedBonus}\n` +
          `• Payment Date: ${formattedPaymentDate}\n` +
          (bonusDetails.signingBonusId
            ? `• Bonus ID: ${bonusDetails.signingBonusId.slice(-8)}\n`
            : '') +
          `\n📌 Action Required:\n` +
          `• Review the signing bonus in Payroll → Review Signing Bonuses\n` +
          `• Approve or reject before payroll initiation\n` +
          `• Ensure bonus is processed in the correct payroll period`;

        const notification = await this.notificationLogModel.create({
          to: new Types.ObjectId(payrollUserId),
          type: NotificationType.SIGNING_BONUS_PENDING_REVIEW,
          message: message,
          data: {
            employeeId: bonusDetails.employeeId,
            employeeName: bonusDetails.employeeName,
            employeeNumber: bonusDetails.employeeNumber,
            positionTitle: bonusDetails.positionTitle,
            signingBonusAmount: bonusDetails.signingBonusAmount,
            signingBonusId: bonusDetails.signingBonusId,
            paymentDate: bonusDetails.paymentDate.toISOString(),
            action: 'SIGNING_BONUS_PENDING_REVIEW',
          },
          isRead: false,
        });

        notifications.push(notification);
        console.log(
          `[PAYROLL_NOTIFICATION] Sent SIGNING_BONUS_PENDING_REVIEW to: ${payrollUserId}`
        );
      } catch (error) {
        console.error(
          `[PAYROLL_NOTIFICATION] Failed to notify payroll user ${payrollUserId} about signing bonus:`,
          error
        );
      }
    }

    console.log(
      `[PAYROLL_NOTIFICATION] Created ${notifications.length} notifications for signing bonus (ONB-019)`
    );

    return {
      success: true,
      notificationsCreated: notifications.length,
      notifications,
    };
  }

  // ONB-018: Notify HR about Payroll Task Completion
  async notifyHRPayrollTaskCompleted(
    hrUserIds: string[],
    completionDetails: {
      employeeId: string;
      employeeName: string;
      positionTitle: string;
      grossSalary: number;
    }
  ) {
    if (!hrUserIds || hrUserIds.length === 0) {
      return { success: true, notificationsCreated: 0 };
    }

    const notifications: any[] = [];
    const formattedSalary = completionDetails.grossSalary.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });

    for (const hrUserId of hrUserIds) {
      try {
        const message =
          `✅ Payroll Task Completed (ONB-018)\n\n` +
          `Payroll initiation has been completed for a new hire.\n\n` +
          `👤 Employee: ${completionDetails.employeeName}\n` +
          `📋 Position: ${completionDetails.positionTitle}\n` +
          `💰 Gross Salary: ${formattedSalary}\n\n` +
          `The employee is now ready for payroll inclusion. ` +
          `The payroll team has been notified.`;

        const notification = await this.notificationLogModel.create({
          to: new Types.ObjectId(hrUserId),
          type: NotificationType.ONBOARDING_PAYROLL_TASK_COMPLETED,
          message: message,
          data: {
            employeeId: completionDetails.employeeId,
            employeeName: completionDetails.employeeName,
            positionTitle: completionDetails.positionTitle,
            grossSalary: completionDetails.grossSalary,
            action: 'PAYROLL_TASK_COMPLETED',
          },
          isRead: false,
        });

        notifications.push(notification);
      } catch (error) {
        console.error(`[PAYROLL_NOTIFICATION] Failed to notify HR user ${hrUserId}:`, error);
      }
    }

    return {
      success: true,
      notificationsCreated: notifications.length,
    };
  }

  // ===== ONBOARDING NOTIFICATIONS =====
  // ONB-005: Send Welcome Notification to New Hire
  async notifyNewHireWelcome(
    newHireId: string,
    welcomeDetails: {
      employeeName: string;
      employeeNumber: string;
      positionTitle: string;
      startDate: Date;
      totalTasks: number;
      onboardingId: string;
    }
  ) {
    if (!newHireId) {
      return { success: false, message: 'No new hire ID provided' };
    }

    try {
      const formattedStartDate = welcomeDetails.startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const message =
        `🎉 Welcome to the Team, ${welcomeDetails.employeeName}!\n\n` +
        `We're excited to have you join us as ${welcomeDetails.positionTitle}.\n\n` +
        `🔐 Your Login Credentials:\n` +
        `• Employee Number: ${welcomeDetails.employeeNumber}\n` +
        `• Password: Use the same password you created during registration\n\n` +
        `📋 Your Onboarding Summary:\n` +
        `• Start Date: ${formattedStartDate}\n` +
        `• Total Tasks: ${welcomeDetails.totalTasks} tasks to complete\n\n` +
        `📌 Next Steps:\n` +
        `• Log in with your Employee Number above\n` +
        `• Visit "My Onboarding" to view your task tracker\n` +
        `• Upload required documents (ID, certifications)\n` +
        `• Complete tasks before deadlines\n\n` +
        `If you have any questions, contact HR. Welcome aboard! 🚀`;

      const notification = await this.notificationLogModel.create({
        to: new Types.ObjectId(newHireId),
        type: NotificationType.ONBOARDING_WELCOME,
        message: message,
        data: {
          employeeName: welcomeDetails.employeeName,
          employeeNumber: welcomeDetails.employeeNumber,
          positionTitle: welcomeDetails.positionTitle,
          startDate: welcomeDetails.startDate.toISOString(),
          totalTasks: welcomeDetails.totalTasks,
          onboardingId: welcomeDetails.onboardingId,
          action: 'WELCOME',
        },
        isRead: false,
      });

      console.log(
        `[ONBOARDING_NOTIFICATION] Sent WELCOME notification to new hire: ${newHireId} (Employee Number: ${welcomeDetails.employeeNumber})`
      );

      return {
        success: true,
        notification,
      };
    } catch (error) {
      console.error(`[ONBOARDING_NOTIFICATION] Failed to send welcome notification:`, error);
      return { success: false, error };
    }
  }

  // ONB-005: Send Task Reminder Notification
  async notifyOnboardingTaskReminder(
    recipientId: string,
    reminderDetails: {
      employeeName: string;
      taskName: string;
      taskDepartment: string;
      deadline: Date;
      isOverdue: boolean;
      daysRemaining?: number;
    }
  ) {
    if (!recipientId) {
      return { success: false, message: 'No recipient ID provided' };
    }

    try {
      const formattedDeadline = reminderDetails.deadline.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const urgencyEmoji = reminderDetails.isOverdue ? '🚨' : '⏰';
      const urgencyText = reminderDetails.isOverdue
        ? 'OVERDUE'
        : `Due in ${reminderDetails.daysRemaining} day(s)`;

      const message =
        `${urgencyEmoji} Onboarding Task Reminder\n\n` +
        `👤 Employee: ${reminderDetails.employeeName}\n` +
        `📋 Task: ${reminderDetails.taskName}\n` +
        `🏢 Department: ${reminderDetails.taskDepartment}\n` +
        `📅 Deadline: ${formattedDeadline}\n` +
        `⚠️ Status: ${urgencyText}\n\n` +
        `Please complete this task as soon as possible.`;

      const notification = await this.notificationLogModel.create({
        to: new Types.ObjectId(recipientId),
        type: NotificationType.ONBOARDING_TASK_REMINDER,
        message: message,
        data: {
          employeeName: reminderDetails.employeeName,
          taskName: reminderDetails.taskName,
          taskDepartment: reminderDetails.taskDepartment,
          deadline: reminderDetails.deadline.toISOString(),
          isOverdue: reminderDetails.isOverdue,
          daysRemaining: reminderDetails.daysRemaining,
          action: 'TASK_REMINDER',
        },
        isRead: false,
      });

      console.log(`[ONBOARDING_NOTIFICATION] Sent task reminder to: ${recipientId}`);
      return {
        success: true,
        notification,
      };
    } catch (error) {
      console.error(`[ONBOARDING_NOTIFICATION] Failed to send task reminder:`, error);
      return { success: false, error };
    }
  }

  // ONB-007: Notify HR about Document Upload
  async notifyHRDocumentUploaded(
    hrUserIds: string[],
    documentDetails: {
      employeeId: string;
      employeeName: string;
      documentType: string;
      documentName: string;
      taskName: string;
      onboardingId: string;
    }
  ) {
    if (!hrUserIds || hrUserIds.length === 0) {
      return { success: true, notificationsCreated: 0 };
    }

    const notifications: any[] = [];

    for (const hrUserId of hrUserIds) {
      try {
        const message =
          `📄 Document Uploaded (ONB-007)\n\n` +
          `A new hire has uploaded a compliance document.\n\n` +
          `👤 Employee: ${documentDetails.employeeName}\n` +
          `📋 Task: ${documentDetails.taskName}\n` +
          `📁 Document Type: ${documentDetails.documentType}\n` +
          `📎 File: ${documentDetails.documentName}\n\n` +
          `📌 Action Required:\n` +
          `• Review the document for compliance\n` +
          `• Verify document authenticity\n` +
          `• Mark task as verified if approved`;

        const notification = await this.notificationLogModel.create({
          to: new Types.ObjectId(hrUserId),
          type: NotificationType.ONBOARDING_DOCUMENT_UPLOADED,
          message: message,
          data: {
            employeeId: documentDetails.employeeId,
            employeeName: documentDetails.employeeName,
            documentType: documentDetails.documentType,
            documentName: documentDetails.documentName,
            taskName: documentDetails.taskName,
            onboardingId: documentDetails.onboardingId,
            action: 'DOCUMENT_UPLOADED',
          },
          isRead: false,
        });

        notifications.push(notification);
      } catch (error) {
        console.error(`[ONBOARDING_NOTIFICATION] Failed to notify HR user ${hrUserId}:`, error);
      }
    }

    return {
      success: true,
      notificationsCreated: notifications.length,
    };
  }

  // ONB-009, ONB-013: Notify about Access Provisioning
  async notifyAccessProvisioned(
    recipientIds: string[],
    accessDetails: {
      employeeId: string;
      employeeName: string;
      accessType: string;
      systemName: string;
      provisionedBy: string;
    }
  ) {
    if (!recipientIds || recipientIds.length === 0) {
      return { success: true, notificationsCreated: 0 };
    }

    const notifications: any[] = [];

    for (const recipientId of recipientIds) {
      try {
        const message =
          `🔐 Access Provisioned (ONB-009)\n\n` +
          `System access has been provisioned.\n\n` +
          `👤 Employee: ${accessDetails.employeeName}\n` +
          `🔑 Access Type: ${accessDetails.accessType}\n` +
          `💻 System: ${accessDetails.systemName}\n` +
          `👤 Provisioned By: ${accessDetails.provisionedBy}\n\n` +
          `The employee can now access the system.`;

        const notification = await this.notificationLogModel.create({
          to: new Types.ObjectId(recipientId),
          type: NotificationType.ONBOARDING_ACCESS_PROVISIONED,
          message: message,
          data: {
            employeeId: accessDetails.employeeId,
            employeeName: accessDetails.employeeName,
            accessType: accessDetails.accessType,
            systemName: accessDetails.systemName,
            provisionedBy: accessDetails.provisionedBy,
            action: 'ACCESS_PROVISIONED',
          },
          isRead: false,
        });

        notifications.push(notification);
      } catch (error) {
        console.error(
          `[ONBOARDING_NOTIFICATION] Failed to notify ${recipientId} about access:`,
          error
        );
      }
    }

    return {
      success: true,
      notificationsCreated: notifications.length,
    };
  }

  // ONB-012: Notify about Equipment/Workspace Reserved
  async notifyEquipmentReserved(
    recipientIds: string[],
    reservationDetails: {
      employeeId: string;
      employeeName: string;
      equipmentList: string[];
      workspaceDetails?: string;
      reservedBy: string;
      readyDate: Date;
    }
  ) {
    if (!recipientIds || recipientIds.length === 0) {
      return { success: true, notificationsCreated: 0 };
    }

    const notifications: any[] = [];
    const formattedReadyDate = reservationDetails.readyDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    for (const recipientId of recipientIds) {
      try {
        const equipmentListText =
          reservationDetails.equipmentList.length > 0
            ? reservationDetails.equipmentList.map((item) => `  • ${item}`).join('\n')
            : '  • No equipment specified';

        const message =
          `🏢 Equipment & Workspace Reserved (ONB-012)\n\n` +
          `Resources have been reserved for the new hire.\n\n` +
          `👤 Employee: ${reservationDetails.employeeName}\n` +
          `📅 Ready Date: ${formattedReadyDate}\n\n` +
          `📦 Equipment:\n${equipmentListText}\n` +
          (reservationDetails.workspaceDetails
            ? `\n🪑 Workspace: ${reservationDetails.workspaceDetails}\n`
            : '') +
          `\n👤 Reserved By: ${reservationDetails.reservedBy}\n\n` +
          `All resources will be ready on Day 1.`;

        const notification = await this.notificationLogModel.create({
          to: new Types.ObjectId(recipientId),
          type: NotificationType.ONBOARDING_EQUIPMENT_RESERVED,
          message: message,
          data: {
            employeeId: reservationDetails.employeeId,
            employeeName: reservationDetails.employeeName,
            equipmentList: reservationDetails.equipmentList,
            workspaceDetails: reservationDetails.workspaceDetails,
            reservedBy: reservationDetails.reservedBy,
            readyDate: reservationDetails.readyDate.toISOString(),
            action: 'EQUIPMENT_RESERVED',
          },
          isRead: false,
        });

        notifications.push(notification);
      } catch (error) {
        console.error(
          `[ONBOARDING_NOTIFICATION] Failed to notify ${recipientId} about equipment:`,
          error
        );
      }
    }

    return {
      success: true,
      notificationsCreated: notifications.length,
    };
  }

  // ONB-001: Notify Departments About Assigned Onboarding Tasks
  async notifyOnboardingTaskAssigned(
    recipientIds: string[],
    taskDetails: {
      employeeId: string;
      employeeName: string;
      department: string;
      tasks: string[];
      deadline: Date;
      onboardingId: string;
    }
  ) {
    if (!recipientIds || recipientIds.length === 0) {
      return { success: true, notificationsCreated: 0 };
    }

    const notifications: any[] = [];
    const formattedDeadline = taskDetails.deadline.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const deptConfig: Record<string, { emoji: string; title: string }> = {
      IT: { emoji: '💻', title: 'IT Department' },
      Admin: { emoji: '🏢', title: 'Admin/Facilities' },
      HR: { emoji: '👥', title: 'HR Department' },
    };
    const config = deptConfig[taskDetails.department] || {
      emoji: '📋',
      title: taskDetails.department,
    };

    for (const recipientId of recipientIds) {
      try {
        const taskListText =
          taskDetails.tasks.length > 0
            ? taskDetails.tasks.map((task) => `  • ${task}`).join('\n')
            : '  • No tasks specified';

        const message =
          `${config.emoji} Onboarding Tasks Assigned - ${config.title}\n\n` +
          `You have been assigned onboarding tasks for a new hire.\n\n` +
          `👤 New Hire: ${taskDetails.employeeName}\n` +
          `📅 Deadline: ${formattedDeadline}\n\n` +
          `📋 Your Tasks:\n${taskListText}\n\n` +
          `Please complete these tasks before the deadline to ensure the new hire is ready on Day 1.`;

        const notification = await this.notificationLogModel.create({
          to: new Types.ObjectId(recipientId),
          type: NotificationType.ONBOARDING_TASK_REMINDER,
          message: message,
          data: {
            employeeId: taskDetails.employeeId,
            employeeName: taskDetails.employeeName,
            department: taskDetails.department,
            tasks: taskDetails.tasks,
            deadline: taskDetails.deadline.toISOString(),
            onboardingId: taskDetails.onboardingId,
            action: 'ONBOARDING_TASK_ASSIGNED',
          },
          isRead: false,
        });

        notifications.push(notification);
        console.log(
          `[ONBOARDING_NOTIFICATION] Task assignment sent to ${recipientId} for ${taskDetails.department}`
        );
      } catch (error) {
        console.error(
          `[ONBOARDING_NOTIFICATION] Failed to notify ${recipientId} about tasks:`,
          error
        );
      }
    }

    console.log(
      `[ONBOARDING_NOTIFICATION] Sent ${notifications.length} task assignment notifications for ${taskDetails.department}`
    );

    return {
      success: true,
      notificationsCreated: notifications.length,
    };
  }

  // Notify about Onboarding Completion
  async notifyOnboardingCompleted(
    recipientIds: string[],
    completionDetails: {
      employeeId: string;
      employeeName: string;
      positionTitle: string;
      completedDate: Date;
      totalTasks: number;
    }
  ) {
    if (!recipientIds || recipientIds.length === 0) {
      return { success: true, notificationsCreated: 0 };
    }

    const notifications: any[] = [];
    const formattedDate = completionDetails.completedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    for (const recipientId of recipientIds) {
      try {
        const message =
          `🎉 Onboarding Completed!\n\n` +
          `All onboarding tasks have been successfully completed.\n\n` +
          `👤 Employee: ${completionDetails.employeeName}\n` +
          `📋 Position: ${completionDetails.positionTitle}\n` +
          `📅 Completion Date: ${formattedDate}\n` +
          `✅ Tasks Completed: ${completionDetails.totalTasks}\n\n` +
          `Welcome to the team! The employee is now fully onboarded.`;

        const notification = await this.notificationLogModel.create({
          to: new Types.ObjectId(recipientId),
          type: NotificationType.ONBOARDING_COMPLETED,
          message: message,
          data: {
            employeeId: completionDetails.employeeId,
            employeeName: completionDetails.employeeName,
            positionTitle: completionDetails.positionTitle,
            completedDate: completionDetails.completedDate.toISOString(),
            totalTasks: completionDetails.totalTasks,
            action: 'ONBOARDING_COMPLETED',
          },
          isRead: false,
        });

        notifications.push(notification);
      } catch (error) {
        console.error(
          `[ONBOARDING_NOTIFICATION] Failed to notify ${recipientId} about completion:`,
          error
        );
      }
    }

    return {
      success: true,
      notificationsCreated: notifications.length,
    };
  }

  // Get all onboarding-related notifications for a user
  async getOnboardingNotifications(userId: string) {
    const notifications = await this.notificationLogModel
      .find({
        to: new Types.ObjectId(userId),
        type: {
          $in: [
            NotificationType.NEW_HIRE_PAYROLL_READY,
            NotificationType.SIGNING_BONUS_PENDING_REVIEW,
            NotificationType.ONBOARDING_PAYROLL_TASK_COMPLETED,
            NotificationType.ONBOARDING_WELCOME,
            NotificationType.ONBOARDING_TASK_REMINDER,
            NotificationType.ONBOARDING_COMPLETED,
            NotificationType.ONBOARDING_DOCUMENT_UPLOADED,
            NotificationType.ONBOARDING_ACCESS_PROVISIONED,
            NotificationType.ONBOARDING_EQUIPMENT_RESERVED,
          ],
        },
      })
      .sort({ createdAt: -1 })
      .exec();

    return {
      count: notifications.length,
      notifications,
    };
  }

  // Get payroll-related notifications for Payroll team
  async getPayrollNotifications(userId: string) {
    const notifications = await this.notificationLogModel
      .find({
        to: new Types.ObjectId(userId),
        type: {
          $in: [
            NotificationType.NEW_HIRE_PAYROLL_READY,
            NotificationType.SIGNING_BONUS_PENDING_REVIEW,
          ],
        },
      })
      .sort({ createdAt: -1 })
      .exec();

    const newHireNotifications = notifications.filter(
      (n) => n.type === NotificationType.NEW_HIRE_PAYROLL_READY
    );
    const signingBonusNotifications = notifications.filter(
      (n) => n.type === NotificationType.SIGNING_BONUS_PENDING_REVIEW
    );

    return {
      totalCount: notifications.length,
      newHires: {
        count: newHireNotifications.length,
        notifications: newHireNotifications,
      },
      signingBonuses: {
        count: signingBonusNotifications.length,
        notifications: signingBonusNotifications,
      },
      all: notifications,
    };
  }
}
