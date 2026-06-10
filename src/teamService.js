export class TeamService {
  createTeam({ ownerId, name }) {
    return { id: crypto.randomUUID(), ownerId, name, members: [{ userId: ownerId, role: "owner" }] };
  }

  inviteMember(team, userId, role = "member") {
    return { ...team, members: [...team.members, { userId, role }] };
  }
}

export const teamService = new TeamService();
