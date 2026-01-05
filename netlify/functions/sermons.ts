import { Handler } from "@netlify/functions"
import { google } from "googleapis"

const PLACEHOLDER_IMAGE =
  "https://your-site.com/sermon-placeholder.jpg"

type Sermon = {
  date: string
  title: string
  series?: string
  part?: number
  preacher: string
  link: string
  length: number
  image: string
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
      range: "sermons!A2:H",
    })

    const rows = response.data.values || []

    const sermons: Sermon[] = rows
      .map((row) => {
        const [
          DATE,
          TITLE,
          SERIES,
          PART,
          PREACHER,
          LINK,
          LENGTH,
          IMAGE,
        ] = row

        if (!DATE || !LINK || !LENGTH) return null

        return {
          date: new Date(DATE).toISOString().slice(0, 10),
          title: TITLE || "",
          series: SERIES || undefined,
          part: PART ? Number(PART) : undefined,
          preacher: PREACHER==="Luke Iannello" ? "" : "Presented by " + PREACHER,
          link: LINK,
          length: Number(LENGTH),
          image: IMAGE || PLACEHOLDER_IMAGE,
        }
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          new Date(b!.date).getTime() -
          new Date(a!.date).getTime()
      ) as Sermon[]

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
      body: JSON.stringify(sermons),
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: "Failed to load sermons",
    }
  }
}