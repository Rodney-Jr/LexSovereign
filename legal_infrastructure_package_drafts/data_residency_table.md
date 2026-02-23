# Data Residency & Hosting Transparency Table

> **CONFIDENTIAL DRAFT - FOR INTERNAL LEGAL REVIEW ONLY**
> **DO NOT DEPLOY WITHOUT EXPLICIT APPROVAL FROM LICENSED COUNSEL**

---

This document outlines the infrastructure details regarding data storage locations, to facilitate transparency for clients subject to strict geographical data regulations.

## 1. Hosting Provider & Region Placeholder Matrix

Below is a template for the default and optional hosting deployments for NomosDesk tenants.

| Region | Primary Hosting Provider | Primary Data Center Location | Backup / Disaster Recovery Location | Customer Applicability |
| :--- | :--- | :--- | :--- | :--- |
| **North America (Default)** | **[Insert, e.g., AWS]** | **[Insert, e.g., US East (N. Virginia) us-east-1]** | **[Insert, e.g., US West (Oregon) us-west-2]** | Available to all users. Default deployment zone. |
| **European Union** | **[Insert, e.g., AWS / Google Cloud]** | **[Insert, e.g., EU (Frankfurt) eu-central-1]** | **[Insert, e.g., EU (Ireland) eu-west-1]** | **[Available / Not Available]** for Enterprise Tier only upon request. |
| **United Kingdom** | **[Insert, e.g., AWS]** | **[Insert, e.g., Europe (London) eu-west-2]** | **[To be defined if applicable]** | **[Available / Not Available]** for UK specific customer cohorts. |
| **Asia Pacific** | **[Insert, e.g., AWS]** | **[Insert, e.g., APAC (Sydney) ap-southeast-2]** | **[To be defined if applicable]** | **[Available / Not Available]** |

## 2. Transfer Safeguard Description Section
Transfers of Personal Data originating from the EU/EEA, UK, or Switzerland to jurisdictions outside these territories (such as the default US hosting) require legal mechanisms.

**Proposed Legal Mechanism Language:**
"Where Client Data is transferred to our default infrastructure in the United States or other non-adequate jurisdictions, NomosDesk will rely upon legally recognized framework mechanisms, specifically the **[Insert Framework, e.g., Standard Contractual Clauses (SCCs) enacted by the European Commission, and the equivalent UK Addendum]**. These constitute our legally binding commitment to protect subject data irrespective of hosting geography."

## 3. Integrated Subprocessor Registry Template

NomosDesk relies on specialized third-party infrastructure and service providers ("Subprocessors") to deliver aspects of the platform. We establish Data Processing Agreements (DPAs) containing strict security and privacy obligations with these entities.

**Active Subprocessor List:**

| Subprocessor Name | Type of Service Provided | Location of Headquarters / Processing Location | Link to Vendor Privacy/Security Policy |
| :--- | :--- | :--- | :--- |
| **[Example: Amazon Web Services (AWS)]** | Cloud Infrastructure & Cloud Database Hosting | USA / Global | **[Link]** |
| **[Example: OpenAI, API only]** | Cloud Provider / Generating AI Drafts (Zero Data Retention) | USA / Global | **[Link]** |
| **[Example: Stripe]** | Payment Processing | USA / Global | **[Link]** |
| **[Example: SendGrid / Postmark]** | Transactional Email Delivery | USA / Global | **[Link]** |
| **[Example: Sentry]** | Error Tracking & Application Telemetry | USA / Global | **[Link]** |

**Note on AI Tools:** We must explicitly verify and clarify if any subprocessor involved in the Generative AI (e.g. LLM Providers via API) retains data for any duration beyond the immediate inference request, and document that explicitly.
