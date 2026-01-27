export const INDUSTRY_TEMPLATES: Record<string, { name: string, description: string, permissions: string[] }[]> = {
    'LAW_FIRM': [
        {
            name: 'MANAGING_PARTNER',
            description: 'Firm leadership with full operational control.',
            permissions: ['manage_tenant', 'approve_spend', 'sign_document', 'manage_users', 'read_billing']
        },
        {
            name: 'EQUITY_PARTNER',
            description: 'Owner of client relationships and matters.',
            permissions: ['sign_document', 'close_matter', 'approve_billing', 'override_ai']
        },
        {
            name: 'SENIOR_ASSOCIATE',
            description: 'Experienced lawyer leading execution.',
            permissions: ['create_matter', 'edit_document', 'draft_document', 'review_work']
        },
        {
            name: 'JUNIOR_ASSOCIATE',
            description: 'Junior lawyer execution role.',
            permissions: ['draft_document', 'execute_research', 'upload_document']
        },
        {
            name: 'PARALEGAL',
            description: 'Legal support staff.',
            permissions: ['upload_document', 'execute_research', 'organize_files']
        }
    ],
    'BANKING': [
        {
            name: 'CHIEF_LEGAL_OFFICER',
            description: 'Top legal executive for the bank.',
            permissions: ['manage_tenant', 'approve_matter_high_risk', 'read_all_audits', 'manage_roles']
        },
        {
            name: 'COMPLIANCE_DIRECTOR',
            description: 'Head of AML/KYC and regulatory compliance.',
            permissions: ['read_all_audits', 'configure_rre', 'report_suspicious', 'approve_kyc']
        },
        {
            name: 'REGULATORY_COUNSEL',
            description: 'Legal counsel for regulatory interpretation.',
            permissions: ['edit_policy', 'override_ai', 'configure_rre']
        },
        {
            name: 'LOAN_DOC_SPECIALIST',
            description: 'Specialist for high-volume loan documentation.',
            permissions: ['draft_document', 'verify_collateral', 'sign_document']
        },
        {
            name: 'DATA_PRIVACY_OFFICER',
            description: 'Ensures GLBA/GDPR data compliance.',
            permissions: ['configure_scrub', 'audit_access']
        }
    ],
    'INSURANCE': [
        {
            name: 'CLAIMS_COUNSEL',
            description: 'Counsel determining claim validity and coverage.',
            permissions: ['assess_coverage', 'approve_settlement', 'manage_outside_counsel']
        },
        {
            name: 'LITIGATION_MANAGER',
            description: 'Oversees active litigation and defense.',
            permissions: ['assign_counsel', 'approve_spend', 'read_billing']
        },
        {
            name: 'UNDERWRITING_COUNSEL',
            description: 'Legal support for policy creation.',
            permissions: ['review_policy_language', 'edit_document']
        },
        {
            name: 'PANEL_LIAISON',
            description: 'Coordinator for external law firms.',
            permissions: ['upload_document', 'read_billing', 'manage_outside_counsel']
        }
    ],
    'SME_LEGAL': [
        {
            name: 'SOLO_GC',
            description: 'General Counsel handling all legal functions.',
            permissions: ['manage_tenant', 'create_matter', 'sign_document', 'approve_spend', 'manage_users']
        },
        {
            name: 'LEGAL_OPS_LEAD',
            description: 'Manages legal tech and processes.',
            permissions: ['design_workflow', 'configure_bridge', 'manage_users']
        },
        {
            name: 'CONTRACT_MANAGER',
            description: 'Focuses on commercial agreement lifecycles.',
            permissions: ['draft_document', 'edit_document', 'upload_document']
        }
    ],
    'INTELLECTUAL_PROPERTY': [
        {
            name: 'PATENT_ATTORNEY',
            description: 'Specialist in patent prosecution and lifecycle.',
            permissions: ['manage_patent_portfolio', 'sign_document', 'conduct_prior_art_research', 'create_matter']
        },
        {
            name: 'TRADEMARK_COUNSEL',
            description: 'Focuses on brand protection and enforcement.',
            permissions: ['check_conflicts', 'draft_document', 'edit_document', 'sign_document']
        },
        {
            name: 'IP_DOCKET_CLERK',
            description: 'Manages filings and deadline tracking.',
            permissions: ['upload_document', 'organize_files', 'create_matter']
        }
    ],
    'MARITIME_LAW': [
        {
            name: 'ADMIRALTY_COUNSEL',
            description: 'Specialist in maritime liens and vessel arrests.',
            permissions: ['manage_admiralty_claims', 'verify_vessel_registry', 'sign_document', 'create_matter']
        },
        {
            name: 'LOGISTICS_ADVISOR',
            description: 'Regulatory support for shipping and trade.',
            permissions: ['edit_document', 'execute_research', 'draft_document']
        }
    ],
    'REAL_ESTATE': [
        {
            name: 'CONVEYANCING_PARTNER',
            description: 'Leads property transfer and land administration.',
            permissions: ['manage_conveyancing', 'verify_title_deeds', 'sign_document', 'approve_spend']
        },
        {
            name: 'LEASING_SOLICITOR',
            description: 'Specialist in commercial and residential leases.',
            permissions: ['draft_document', 'edit_document', 'sign_document']
        },
        {
            name: 'TITLE_SEARCHER',
            description: 'Performs due diligence on land registry.',
            permissions: ['verify_title_deeds', 'execute_research', 'upload_document']
        }
    ],
    'PUBLIC_SECTOR': [
        {
            name: 'ATTORNEY_GENERAL',
            description: 'Top legal authority for the jurisdiction.',
            permissions: ['manage_platform', 'manage_tenant', 'approve_matter_high_risk', 'read_all_audits', 'sign_document']
        },
        {
            name: 'LEGISLATIVE_DRAFTIER',
            description: 'Specialist in crafting statutory instruments.',
            permissions: ['draft_legislation', 'edit_document', 'design_workflow']
        },
        {
            name: 'PUBLIC_PROSECUTOR',
            description: 'Legal authority for criminal and state litigation.',
            permissions: ['create_matter', 'draft_document', 'edit_document', 'review_work']
        }
    ]
};
