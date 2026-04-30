import { Avatar } from "../ui/Avatar";

export const TeamAvatarStack = ({ members = [], max = 4, size = "sm" }) => {
  const visibleMembers = members.slice(0, max);
  const overflowCount = Math.max(members.length - visibleMembers.length, 0);

  return (
    <div className="flex items-center">
      {visibleMembers.map((member, index) => (
        <div
          key={member.id || member.name}
          className={index ? "-ml-3" : ""}
          title={member.name}
        >
          <Avatar name={member.name} src={member.avatar} size={size} />
        </div>
      ))}
      {overflowCount ? (
        <div className="-ml-3 flex h-8 w-8 items-center justify-center rounded-full border border-white bg-slate-900 text-[11px] font-semibold text-white shadow-sm">
          +{overflowCount}
        </div>
      ) : null}
    </div>
  );
};
