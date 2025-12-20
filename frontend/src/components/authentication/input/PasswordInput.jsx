export default function PasswordInput({ value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-white">Password</label>
      <input
        type="password"
        value={value}          
        onChange={onChange} 
        placeholder="••••••••"
        className="
          h-11 rounded-lg
          bg-slate-800 border border-slate-700
          px-4 text-white placeholder:text-slate-500
          focus:ring-2 focus:ring-primary/70
          transition text-sm
        "
      />
      <p className="text-xs text-slate-500">
        Must be at least 8 characters
      </p>
    </div>
  );
}
