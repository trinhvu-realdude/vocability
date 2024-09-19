export const formatDate = (createdAt: Date, languageCode: string) => {
    const date = new Date(createdAt);
    const formattedDate = date.toLocaleDateString(
        languageCode !== "us" && languageCode
            ? `${languageCode}-${languageCode.toUpperCase()}`
            : "en-US",
        {
            weekday: "short",
            month: "short",
            day: "2-digit",
            year: "numeric",
        }
    );

    const [weekday, month, day, year] = formattedDate
        .replace(",", "")
        .split(" ");
    return `${weekday}, ${day.replace(",", "")} ${month} ${year} ${new Date(
        createdAt
    ).toLocaleTimeString()}`;
};

export const formatDateToDDMMYYYY = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear().toString();

    return `${day}${month}${year}`;
};

export const formatFileName = (
    collectionName: string,
    fileFormat: string
): string => {
    const formattedName = collectionName.toLowerCase().replace(/\s+/g, "-"); // Replaces all spaces with hyphens

    const formatDateToDDMMYYYY = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear().toString();

        return `${day}${month}${year}`;
    };

    const formattedDate = formatDateToDDMMYYYY(new Date());

    return `${formattedName}-${formattedDate}.${fileFormat}`;
};
