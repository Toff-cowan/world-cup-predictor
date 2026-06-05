import TeamFlag from "../standings/TeamFlag.jsx";

export default function TeamPicker({
  teams,
  value,
  onChange,
  placeholder = "Select team",
  disabled = false,
  className = "",
  excludeIds = [],
}) {
  const options = teams.filter((t) => !excludeIds.includes(t.id) || t.id === value);

  return (
    <div className={`flex items-center gap-2 min-w-0 ${className}`}>
      {value && (
        <TeamFlag
          flagUrl={teams.find((t) => t.id === value)?.flag_url}
          countryCode={teams.find((t) => t.id === value)?.country_code}
          teamCode={teams.find((t) => t.id === value)?.code}
          className="w-7 h-5"
        />
      )}
      <select
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="flex-1 min-w-0 text-sm font-medium bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 px-2 py-1.5 rounded-none disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} {t.group_letter ? `(Grp ${t.group_letter})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
