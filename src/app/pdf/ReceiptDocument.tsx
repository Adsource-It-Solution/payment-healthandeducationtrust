import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#f4f2ff",
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    marginBottom: 25,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginBottom: 8,
  },
  orgTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6C2EB9",
  },
  orgSubtitle: {
    fontSize: 10,
    color: "#555",
    marginTop: 3,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 25,
    marginTop: 10,
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  cardTitle: {
    textAlign: "center",
    fontSize: 16,
    color: "#E04FB3",
    marginBottom: 15,
    fontWeight: "bold",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#E04FB3",
    borderRadius: 8,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColLabel: {
    width: "35%",
    backgroundColor: "#fbefff",
    borderRightWidth: 1,
    borderColor: "#E04FB3",
    padding: 6,
  },
  tableColValue: {
    width: "65%",
    padding: 6,
  },
  labelText: {
    fontWeight: "bold",
    color: "#6C2EB9",
  },
  valueText: {
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#E04FB3",
    marginVertical: 10,
  },
  thankyou: {
    textAlign: "center",
    marginTop: 25,
    fontSize: 13,
    color: "#333",
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 10,
    color: "#777",
  },
});

export default function ReceiptDocument({ transaction }: any) {
  const { name, email, phone, amount, paymentId, createdAt } = transaction;

  return (
    <Document>
      <Page style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src="/logo-pdf/png" style={styles.logo} />
          <Text style={styles.orgTitle}>Health and Education Trust</Text>
          <Text style={styles.orgSubtitle}>
            Registered NGO | Promoting Health & Education Initiatives
          </Text>
        </View>

        {/* White Card Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Donation Receipt</Text>
          <View style={styles.table}>
            {/* Name */}
            <View style={styles.tableRow}>
              <View style={styles.tableColLabel}>
                <Text style={styles.labelText}>Donor Name</Text>
              </View>
              <View style={styles.tableColValue}>
                <Text style={styles.valueText}>{name}</Text>
              </View>
            </View>

            {/* Email */}
            <View style={styles.tableRow}>
              <View style={styles.tableColLabel}>
                <Text style={styles.labelText}>Email</Text>
              </View>
              <View style={styles.tableColValue}>
                <Text style={styles.valueText}>{email}</Text>
              </View>
            </View>

            {/* Phone */}
            <View style={styles.tableRow}>
              <View style={styles.tableColLabel}>
                <Text style={styles.labelText}>Phone</Text>
              </View>
              <View style={styles.tableColValue}>
                <Text style={styles.valueText}>{phone}</Text>
              </View>
            </View>

            {/* Amount */}
            <View style={styles.tableRow}>
              <View style={styles.tableColLabel}>
                <Text style={styles.labelText}>Amount</Text>
              </View>
              <View style={styles.tableColValue}>
                <Text style={styles.valueText}>₹{amount}</Text>
              </View>
            </View>

            {/* Payment ID */}
            <View style={styles.tableRow}>
              <View style={styles.tableColLabel}>
                <Text style={styles.labelText}>Payment ID</Text>
              </View>
              <View style={styles.tableColValue}>
                <Text style={styles.valueText}>{paymentId}</Text>
              </View>
            </View>

            {/* Date */}
            <View style={styles.tableRow}>
              <View style={styles.tableColLabel}>
                <Text style={styles.labelText}>Date</Text>
              </View>
              <View style={styles.tableColValue}>
                <Text style={styles.valueText}>
                  {new Date(createdAt).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Thank You */}
        <Text style={styles.thankyou}>
          Thank you for your generous donation!{"\n"}
          Your contribution helps us continue our mission to make healthcare and
          education accessible to all.
        </Text>

        {/* Footer */}
        <Text style={styles.footer}>
          Health and Education Trust • New Delhi, India
        </Text>
      </Page>
    </Document>
  );
}
