import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#fff",
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6C2EB9",
    textAlign: "center",
  },
  section: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  label: {
    fontWeight: "bold",
    color: "#E04FB3",
  },
  text: {
    marginBottom: 4,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 11,
    color: "#555",
  },
});

export default function ReceiptDocument({ transaction }: any) {
  const { name, email, phone, amount, paymentId, createdAt } = transaction;

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.header}>
          {/* If you have a local logo file, use absolute path or public URL */}
          <Image src="/logo-pdf.png" style={styles.logo} />
          <Text style={styles.title}>Donation Receipt</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>
            <Text style={styles.label}>Name: </Text>{name}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Email: </Text>{email}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Phone: </Text>{phone}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Amount: </Text>₹{amount}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Payment ID: </Text>{paymentId}
          </Text>
          <Text style={styles.text}>
            <Text style={styles.label}>Date: </Text>
            {new Date(createdAt).toLocaleString()}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Thank you for your generous donation!</Text>
          <Text>Your contribution helps us continue our work 🙏</Text>
        </View>
      </Page>
    </Document>
  );
}
