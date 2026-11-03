function WelcomeAvatar({ gender = "" }) {
    const normalizedGender = String(gender).trim().toLowerCase();
    const isFemale = normalizedGender === "female";
    const isMale = normalizedGender === "male";
    const label = isFemale ? "Girl student" : isMale ? "Boy student" : "Student";

    return (
        <svg className={`welcome-avatar ${isFemale ? "is-female" : isMale ? "is-male" : "is-neutral"}`} viewBox="0 0 260 190" role="img" aria-label={label}>
            <circle cx="224" cy="42" r="8" fill="#ffd166" />
            <circle cx="36" cy="54" r="6" fill="#ff7d9a" />
            <circle cx="68" cy="145" r="5" fill="#59e0c1" />
            <path d="M220 80c18 0 25 13 25 30v31h-44v-37c0-14 7-24 19-24Z" fill="#72b4ff" />
            <path d="M214 92h27v31h-27z" rx="4" fill="#f5fbff" />
            <path d="M218 101h18M218 108h13" stroke="#8299bd" strokeWidth="2" strokeLinecap="round" />
            <path d="M83 165c3-30 22-48 53-48s50 18 53 48v25H83z" fill={isFemale ? "#e878a8" : isMale ? "#4385dc" : "#6655be"} />
            <path d="M119 123h34l8 15-25 20-25-20z" fill="#f7fbff" />
            <path d="M130 137h7l5 31h-17z" fill={isFemale ? "#8e55cf" : "#315fb5"} />
            <rect x="126" y="101" width="23" height="29" rx="10" fill="#d99570" />
            {isFemale && <path d="M94 72c0-31 17-48 44-48s43 18 43 49v49c-11 7-18-7-20-17l-3-25h-45l-2 26c-2 12-8 22-17 16z" fill="#49384a" />}
            <ellipse cx="137" cy="78" rx="35" ry="42" fill="#efb58f" />
            {isFemale
                ? <path d="M101 67c4-27 18-39 38-39 20 0 32 12 36 35-12-3-22-12-27-20-10 13-27 21-47 24Z" fill="#49384a" />
                : isMale
                    ? <path d="M103 65c2-23 14-37 34-37 18 0 31 12 35 34-15 1-28-5-37-15-8 10-18 16-32 18Z" fill="#3c3440" />
                    : <path d="M101 64c2-24 16-38 36-38 19 0 33 14 35 37-9-5-13-10-16-18-12 13-34 20-55 19Z" fill="#59424b" />}
            {isFemale && <g fill="#efb58f"><circle cx="101" cy="84" r="3" /><circle cx="173" cy="84" r="3" /></g>}
            <path d="M121 80h3M150 80h3" stroke="#453442" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M130 98c4 4 10 4 14 0" fill="none" stroke="#ad5c64" strokeWidth="2.5" strokeLinecap="round" />
            {!isFemale && <>
                <path d="m99 46 39-21 39 21-39 21z" fill="#243762" />
                <path d="M111 42v14c12 11 32 11 54 0V42" fill="#35538f" />
                <path d="M176 46v20" stroke="#ffd166" strokeWidth="3" />
                <circle cx="176" cy="68" r="4" fill="#ffd166" />
            </>}
            <path d="M91 177h97" stroke="#fff" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round" />
        </svg>
    );
}

export default WelcomeAvatar;
