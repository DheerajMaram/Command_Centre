import './globals.css'

export const metadata = {
  title: 'Command Center',
  description: 'Private ambient dashboard for daily goals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
