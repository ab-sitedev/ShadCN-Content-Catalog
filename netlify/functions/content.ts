import { Handler } from "@netlify/functions"
import { google } from "googleapis"

type Content = {
    date: string;
    title?: string;
    series?: string;
    part?: number;
    author: string;
    link: string;
    length: number;
    image?: string;
    format: string;
}

export const handler: Handler = async () => {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const sheets = google.sheets({ version: "v4", auth })

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: process.env.RANGE
    })

    const rows = response.data.values || []

    const content: Content[] = rows
      .map((row) => {
        const [
          DATE,
          TITLE,
          SERIES,
          PART,
          AUTHOR,
          LINK,
          LENGTH,
          IMAGE,
          FORMAT
        ] = row

        if (!DATE || !LINK || !LENGTH) return null

        return {
          date: new Date(DATE).toISOString().slice(0, 10),
          title: TITLE || "",
          series: SERIES || undefined,
          part: PART ? Number(PART) : undefined,
          // If your content is usually authored by a specific person, below is an example of how to only show the author if they're different from the default person.
          author: (AUTHOR === "Aaron Banister" || AUTHOR === "") ? "" : "Presented by " + AUTHOR,
          link: LINK,
          length: Number(LENGTH),
          image: IMAGE,
          format: FORMAT
        }
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(b!.date).getTime() -
          new Date(a!.date).getTime()
      ) as Content[]

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
      body: JSON.stringify(content),
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: JSON.stringify("Failed to load content"),
    }
  }
}