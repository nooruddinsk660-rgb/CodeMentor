export default function TextInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}              // ✅
        onChange={onChange}        // ✅
        placeholder={placeholder}
        className="h-11 rounded-lg px-4 bg-background-dark border border-surface-border text-white"
      />
    </div>
  );
}
