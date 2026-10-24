import {
  Document,
  Page,
  Text,
  View,
  Link,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";
import { colors, safeLink, type ResumeDocument } from "@/lib/resume/document";
let registered = false;
export function registerFonts(base = "") {
  if (registered) return;
  registered = true;
  for (const family of ["NotoSans", "NotoSerif"])
    Font.register({
      family,
      fonts: [
        {
          src: `${base}/resume-assets/fonts/${family}-Regular.woff`,
          fontWeight: 400,
        },
        {
          src: `${base}/resume-assets/fonts/${family}-Bold.woff`,
          fontWeight: 700,
        },
      ],
    });
  Font.registerHyphenationCallback((word) =>
    word.length > 32 ? word.match(/.{1,24}/gu) || [word] : [word],
  );
}
export function ResumePdf({ document: doc }: { document: ResumeDocument }) {
  const { contact: c, presentation: p } = doc;
  const accent = colors[p.accent];
  const classic = p.template === "classic";
  const styles = StyleSheet.create({
    page: {
      paddingTop: 38,
      paddingBottom: 40,
      paddingHorizontal: 42,
      fontFamily: classic ? "NotoSerif" : "NotoSans",
      fontSize: 9.5,
      lineHeight: 1.5,
      color: "#25262b",
    },
    name: {
      fontSize: classic ? 27 : 30,
      fontWeight: 700,
      color: classic ? "#25262b" : accent,
      lineHeight: 1.15,
      marginBottom: 5,
    },
    headline: { fontSize: 11, marginBottom: 6 },
    contact: { fontSize: 8.5, color: "#55565e", marginBottom: 4 },
    rule: {
      height: classic ? 1 : 2,
      backgroundColor: accent,
      marginTop: 10,
      marginBottom: 6,
    },
    section: { marginTop: p.spacing === "compact" ? 10 : 16 },
    heading: {
      fontSize: 9.5,
      fontWeight: 700,
      letterSpacing: p.template === "technical" ? 1.2 : 0.7,
      color: accent,
      marginBottom: 6,
    },
    entry: { marginBottom: p.spacing === "compact" ? 6 : 9 },
    title: { fontWeight: 700, fontSize: 10 },
    meta: { fontSize: 8.5, color: "#55565e", marginBottom: 3 },
    bullet: { paddingLeft: 9, marginBottom: 2 },
    link: { color: accent, textDecoration: "none" },
    footer: {
      position: "absolute",
      bottom: 18,
      left: 42,
      right: 42,
      fontSize: 8,
      color: "#777",
      textAlign: "right",
    },
  });
  return (
    <Document
      title={`${c.name || "Resume"} — Resume`}
      author={c.name}
      language="en"
    >
      <Page size={p.paper} style={styles.page} wrap>
        <Text style={styles.name}>{c.name || "Your name"}</Text>
        {c.headline && <Text style={styles.headline}>{c.headline}</Text>}
        <Text style={styles.contact}>
          {[c.location, c.email, c.phone].filter(Boolean).join(" · ")}
        </Text>
        <Text style={styles.contact}>
          {(["website", "linkedin", "github"] as const)
            .filter((key) => safeLink(c[key]))
            .map((key, index) => (
              <Link key={key} src={safeLink(c[key])!} style={styles.link}>
                {index ? "   ·   " : ""}
                {c[key].replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </Link>
            ))}
        </Text>
        <View style={styles.rule} />
        {doc.sections
          .filter(
            (s) =>
              s.visible &&
              (s.text.trim() ||
                s.items.some(
                  (i) => i.title || i.subtitle || i.bullets.some(Boolean),
                )),
          )
          .map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.heading} minPresenceAhead={65}>
                {section.heading.toUpperCase()}
              </Text>
              {section.text && <Text>{section.text}</Text>}
              {section.items.map((item) => (
                <View key={item.id} style={styles.entry}>
                  <Text style={styles.title} minPresenceAhead={50}>
                    {item.title}
                    {safeLink(item.url) && (
                      <Link style={styles.link} src={safeLink(item.url)!}>
                        {" "}
                        [link]
                      </Link>
                    )}
                  </Text>
                  <Text style={styles.meta}>
                    {[
                      item.subtitle,
                      item.location,
                      [item.start, item.end].filter(Boolean).join(" – "),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                  {item.bullets.filter(Boolean).map((bullet, index) => (
                    <Text key={index} style={styles.bullet}>
                      • {bullet}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          ))}
        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            totalPages > 1 ? `${pageNumber} / ${totalPages}` : ""
          }
        />
      </Page>
    </Document>
  );
}
