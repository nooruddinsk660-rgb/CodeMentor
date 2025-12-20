export default function ProfileHeader() {
  return (
    <div className="p-6 bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark">
      <div className="flex flex-col gap-4 @[520px]:flex-row @[520px]:justify-between @[520px]:items-center">
        <div className="flex items-center gap-4">
          <div
            className="bg-center bg-cover rounded-full w-20 h-20 sm:w-24 sm:h-24"
            style={{
              backgroundImage: `url("https://lh3.googleusercontent.com/...")`
            }}
          ></div>

          <div>
            <p className="text-text-light-primary dark:text-text-dark-primary text-xl font-bold">
              github-username
            </p>
            <a className="text-primary hover:underline text-base" href="#">
              View GitHub Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
