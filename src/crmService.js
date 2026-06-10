export class CrmService {
  createTicket({ userId, subject, message }) {
    return {
      id: crypto.randomUUID(),
      userId,
      subject,
      message,
      status: "open",
      createdAt: new Date().toISOString(),
    };
  }
}

export const crmService = new CrmService();
