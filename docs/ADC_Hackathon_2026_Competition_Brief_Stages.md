# ADC Hackathon 2026 – Official Competition Brief: 6 Stages of Employability

> **Focus Area:** Visual Impairment  
> **Source:** ADC Hackathon Roundtable Launch (April 2026) – Developed through a collaborative process involving people with lived experience and industry/HR partners.  
> **Target Audience:** Team Offixed / ADC Hackathon 2026 Competitors  
> **Theme Alignment:** AI & Employability (Attitudinal & Communication · Technological · Architectural/Industrial)

---

## Executive Overview & Framework

The competition brief structures the end-to-end employment journey of visually impaired individuals into **6 sequential stages**. Each stage contrasts two vital viewpoints:
1. **People with Lived Experience**: Real barriers encountered in digital and physical environments, daily workflows, and social/professional interactions.
2. **HR & Industry Perspectives**: Root causes why barriers persist, employer anxieties (cost, risk, data privacy, productivity), and practical organizational constraints.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE 6 EMPLOYMENT STAGES                                │
├───────────────┬─────────────────┬────────────────┬───────────────┬────────────┬────────┤
│    STAGE 1    │     STAGE 2     │    STAGE 3     │    STAGE 4    │  STAGE 5   │ STAGE 6│
│    Career     │  Job Search &   │   Interview    │   Workplace   │   On the   │ Career │
│  Preparation  │   Application   │     Stage      │  Onboarding   │    Job     │ Growth │
└───────────────┴─────────────────┴────────────────┴───────────────┴────────────┴────────┘
```

---

## Stage 1: Career Preparation
*(Learn about careers, build skills, connect with people)*

### Problem Statements
> *"Visually impaired individuals face significant barriers in accessing job information, both digitally and in person, hindering effective career preparation."*  
> *"Visually impaired students can't fully participate in career preparation activities because access to information via online and in-person events (such as networking) are not designed with accessibility in mind."*

---

### 1. People with Lived Experience Perspective
* **Inaccessible online job advertisements:** Companies post job descriptions and requirements as images or infographics that screen readers cannot interpret or read out.
* **Inaccessible company websites & job portals:** Proprietary career portals lack semantic HTML, keyboard focus management, or ARIA attributes.
* **Rigid certification timelines:** Required language qualifications (e.g., IELTS) demand up to a 3-month registration lead time for accessible accommodations, frequently overrunning application deadlines.
* **CV builder barriers:** Online CV creation tools lack screen reader support; visually impaired candidates struggle with visual-only layout requirements such as positioning profile photos into predefined boxes.
* **Inaccessible career fairs & job expos:** Events rely almost exclusively on physical signage, printed brochures, and company logos, making autonomous navigation impossible.
* **Networking disconnect:** Difficulty identifying and recognizing attendees at in-person networking events impedes spontaneous peer-to-peer networking.
* **Opaque industry expectations:** Very limited avenues exist for visually impaired candidates to interact informally with hiring managers to learn actual workplace requirements.

---

### 2. HR & Industry Perspective

#### Why This Barrier Persists
* **Lack of accessibility engineering skills:** Product and frontend teams build for visual aesthetics and search engine optimization (SEO), treating real accessibility as an afterthought.
* **Superficial compliance:** Accessibility attributes (such as `alt` text) have historically been populated merely to satisfy automated SEO scoring checklists, rather than delivering descriptive utility to assistive tech users.
* **SME resource shortages:** Small and medium enterprises (SMEs) lack dedicated budget, specialized tooling, or personnel trained in digital accessibility.
* **Absence of regression testing:** Even when W3C / WCAG guidelines are initially referenced, accessibility breaks over time because companies do not conduct ongoing automated or manual testing post-deployment.

#### What Employers Are Worried About
* **Cost of accommodations:** Fear of high upfront costs for workplace adjustments (e.g., purchasing commercial screen reader licenses, re-engineering internal tools).
* **Software compatibility:** Anxiety regarding whether assistive technologies can integrate cleanly with proprietary legacy stacks or internal databases.
* **No standard operating procedure (SOP):** Absence of structured onboarding playbooks or enablement programs tailored for visually impaired staff.

#### Constraints & Realities
* **Budget prioritization:** Digital accessibility investments are consistently deprioritized unless mandated by paying clients, executive leadership, or regulatory enforcement.
* **Awareness gap:** Employers mistakenly believe that accessibility is prohibitively expensive, unaware that building accessibly from the start incurs negligible marginal cost.
* **Fear of the unknown:** Hiring managers are intimidated by unfamiliarity with what reasonable accommodation actually looks like in day-to-day work.

---

## Stage 2: Job Search & Application
*(Prepare CV, apply for jobs, interview preparation)*

### Problem Statement
> *"Visually impaired individuals struggle to navigate and submit job applications due to inaccessible digital platforms, biases in AI screening, and a general lack of accessibility expertise and consistent testing within organisations."*

---

### 1. People with Lived Experience Perspective
* **Inaccessible application pipelines:** Recruitment portals and corporate career sites fail screen-reader compatibility tests.
* **Unusable PDF application forms:** Complex, non-tagged PDF application forms are hostile to screen readers; candidates strongly prefer editable Microsoft Word (`.docx`) or genuinely accessible tagged PDFs.
* **Third-party platform degradation:** Major recruitment boards (e.g., VietnamWorks) frequently flatten text job descriptions into rasterized image files, rendering them completely illegible to screen readers.
* **Image-based employer postings:** Hiring teams post hiring announcements as images/banners on social channels (LinkedIn, Facebook) without providing typed text alternatives.
* **AI applicant tracking system (ATS) bias:** Modern automated screening platforms profile user telemetry (such as dwell time, navigation speed, and distinct assistive click patterns), inadvertently penalizing or filtering out screen-reader users prior to human review—even when no disability is disclosed.
* **The fundamental bottleneck:** The primary barrier is total inability to submit the application form. If the form cannot be submitted, qualification-based evaluation never even begins.

---

### 2. HR & Industry Perspective

#### Why This Barrier Persists
* **Accessibility skills deficit:** Companies lack accessibility engineers. UI/UX designers focus on visual flair and marketing conversions rather than semantic structure and WCAG compliance.
* **Flawed behavioral AI models:** Candidate screening tools cluster behavioral signals based on conventional sighted browsing profiles, flagging non-standard navigation patterns as anomalous or substandard.
* **Lack of market pressure:** Clients and corporate leadership rarely demand accessible candidate portals, leaving accessibility unfunded.
* **Incentives for visual-heavy content:** Modern social media and recruitment algorithms prioritize visual engagement (infographics, image carousels), directly bypassing accessibility best practices.

#### What Employers Are Worried About
* **Upkeep costs:** The engineering overhead of maintaining WCAG-compliant candidate portals.
* **Vendor lock-in & third-party dependency:** Employers rely on external SaaS job portals and ATS platforms whose codebases and accessibility roadmaps they cannot dictate.
* **Questionable business case:** Low perceived volume of applicants with visual impairments makes HR leadership skeptical of allocating budget specifically for accessibility.

#### Constraints & Realities
* **Standards erosion:** Free W3C guidelines exist, but compliance rapidly decays without continuous regression monitoring.
* **Platform discrepancy:** Global enterprise platforms (e.g., LinkedIn) maintain dedicated accessibility teams, whereas Vietnamese domestic platforms (e.g., VietnamWorks) remain largely inaccessible.
* **Opaque AI algorithms:** Algorithmic bias in ATS tools is systemic, subtle, and rarely audited by the companies deploying them.

---

## Stage 3: Interview Stage
*(Attend interviews and communicate with employers)*

### Problem Statements
> *"Interviewer bias, lack of awareness, and fear of the unknown create significant barriers for visually impaired candidates during interviews, often overshadowing their qualifications and potential contributions."*  
> *"Visually impaired candidates face disadvantages in interviews because recruitment processes often rely on visual communication and materials. Also, attitude of interviewers may not have an open mind as human bias."*

---

### 1. People with Lived Experience Perspective
* **Physical interview venue navigation:** Lack of venue orientation, clear wayfinding, or a designated guide from the front entrance/reception to the interview room.
* **Online interview platform volatility:** Different employers deploy disparate web conferencing tools (Zoom, MS Teams, Google Meet, Webex); candidates must spend considerable time mastering each platform's accessibility hotkeys.
* **Surprise and immediate bias:** When a candidate's visual impairment is not disclosed upfront on their CV, interviewers often react with visible shock or awkwardness upon meeting them.
* **Awkward dynamics & hesitation:** Interviewer discomfort frequently translates into hesitation, conversational stiffness, and reluctance to advance the candidate.
* **Deficit-focused questioning:** Interview panels disproportionately dwell on perceived deficits, logistics, and potential accommodation costs rather than evaluating professional competencies.
* **Absence of reasonable adjustment workflows:** SMEs have no standard operating procedures allowing candidates to request accommodations safely and formally.
* **Stifled talent demonstration:** Candidates rarely get the opportunity to showcase their actual workflows and assistive proficiency before unconscious biases dictate the hiring decision.

---

### 2. HR & Industry Perspective

#### Why This Barrier Persists
* **Deep-seated human bias:** Recruiters naturally seek familiarity, ease of management, and predictable social rapport; unfamiliarity breeds risk aversion and candidate rejection.
* **Parallel to regional biases:** In Vietnam, disability bias functions much like entrenched regional accent biases—subtle, habitual, largely unconscious, and rarely challenged openly.
* **Lack of exposure:** Sighted employers who have never collaborated with visually impaired colleagues default to worst-case assumptions regarding operational difficulty.
* **Diffused accountability:** Without a formal accommodation workflow, no single internal stakeholder owns the responsibility of onboarding candidates with disabilities.
* **Non-accessible proprietary interview software:** Custom company test environments and assessment apps lack input from accessibility specialists.

#### What Employers Are Worried About
* **Financial and operational overhead:** The presumed cost and logistical effort of physical office retrofits, specialized equipment, software licensing, and workflow modifications.
* **Managerial uncertainty:** Direct managers do not know how to assign tasks, provide feedback, or communicate effectively with a visually impaired direct report.
* **Perceived productivity penalty:** Stereotypical assumptions that the employee will produce lower output, demand excessive managerial supervision, or become a burden to teammates.
* **Legal and compliance ambiguity:** HR teams are unfamiliar with local labor regulations and disability accommodation legalities in Vietnam.

#### Constraints & Realities
* **Cultural change is hard:** Overcoming interviewer mindset bias is considerably harder than fixing software UI code.
* **SME capacity constraints:** Lean HR teams have zero bandwidth for dedicated diversity, equity, and inclusion (DEI) initiatives.
* **Need for proactive education:** Employers need seamless bridging to external organizations (e.g., Sao Mai Vocational Center, blind associations) to dispel accommodation myths.
* **Reframing the business narrative:** Emphasize business value, meticulousness, and proven low turnover rates rather than appealing solely to charity or corporate social responsibility (CSR).
* **Technical & financial limitations:** Updating internal hiring portals is costly; HR is frequently unaware that plain text formats optimize both searchability and accessibility simultaneously.

---

## Stage 4: Workplace Onboarding
*(Starting a new job and learning workplace rules)*

### Problem Statement
> *"Visually impaired employees face difficulties in familiarising themselves with the physical and digital work environment, especially inaccessible to digital perspective as materials and systems, leading to potential isolation and inability to perform daily tasks effectively, or affecting to the performance of probation."*

---

### 1. People with Lived Experience Perspective
* **Inaccessible onboarding collateral:** Employment contracts, employee handbooks, company policies, and training decks are delivered as scanned PDFs, flat images, or unformatted slides that screen readers cannot parse.
* **Physical office navigation:** Navigating unfamiliar office spaces (locating desks, cafeteria, conference rooms, restrooms) requires significantly more orientation time and initial guidance.
* **Legacy enterprise tools:** Internal data management systems, ERP software, and CRM platforms are often completely incompatible with NVDA/JAWS, directly endangering the employee's probation status if core job tasks cannot be completed.
* **Communication friction with coworkers:** Sighted colleagues do not know how to interact naturally (e.g., nodding or waving instead of vocalizing greetings; sharing uncaptioned images).
* **Social disengagement & isolation cycle:** Missing a subtle visual gesture (like a wave from across the room) can be misconstrued as coldness or unresponsiveness, causing colleagues to withdraw and leaving the employee isolated.
* **IT security policy barriers:** Stringent IT security regulations often ban third-party assistive tools or external screen reader installations on company machines.

---

### 2. HR & Industry Perspective

#### Why This Barrier Persists
* **Procurement blindness:** Internal enterprise tools and vendor software contracts are drafted without accessibility criteria or compliance standards.
* **Zero coworker preparation:** Teammates receive no prior sensitivity briefing, practical communication guide, or orientation on working alongside a visually impaired colleague.
* **Misconceptions about screen reader security:** Security teams mistakenly categorize assistive software (like NVDA or screen magnifiers) as data-exfiltration threats or spyware, unaware that legitimate screen readers run locally without uploading client data.
* **Lack of onboarding buddy frameworks:** Structured buddy systems and designated orientation guides are rarely formalized in mid-market companies.

#### What Employers Are Worried About
* **Data security and privacy leaks:** Unfounded fears that third-party assistive tools or generative AI extensions will send proprietary business data to external cloud servers.
* **Prohibitive retrofit costs:** Modernizing legacy internal software or custom databases to meet screen reader standards is deemed cost-prohibitive and disruptive to operations.
* **Onboarding velocity:** Concerns regarding extended onboarding timelines and temporary productivity dips.
* **Probation evaluation dilemmas:** Uncertainty around how to fairly assess employee capability when internal tools are actively impairing their output.

#### Constraints & Realities
* **Digital barriers trump physical ones:** Physical office navigation is quickly learned within a few weeks, but an inaccessible ERP or database constitutes a hard stop that causes probation failure.
* **Universal design insight:** Accessible materials (e.g., clean, structured Word documents and text-native PowerPoint decks) benefit the entire workforce, not just visually impaired staff.
* **Security audits as an easy fix:** Enterprise security concerns can be systematically alleviated by formal software auditing and verifying local open-source tools like NVDA.

---

## Stage 5: On the Job
*(Working in the job and performing daily tasks)*

### Problem Statement
> *"Visually impaired employees face difficulties completing daily workplace tasks when communications rely heavily on visuals, and when internal systems are not screen-reader accessible."*

---

### 1. People with Lived Experience Perspective
* **Real-time meeting slide inaccessibility:** During live presentations, screen shares contain charts, bullet points, and diagrams that screen readers cannot read in real time, preventing employees from following dynamic discussions.
* **Visual team messaging:** Team collaboration hubs (Slack, Microsoft Teams, Zalo) heavily utilize screenshots, uncaptioned memes, custom emojis, and status graphics.
* **Project updates via visual dashboards:** Project progress is presented via visual flowcharts, Gantt charts, or color-coded boards; visually impaired staff risk appearing uninformed or disengaged, leading to unfair perceptions of low competence.
* **Exclusion from strategic decisions:** Being unable to quickly parse visual models or spreadsheet dashboards excludes employees from fast-paced collaborative decision-making.
* **Proprietary workflow tools:** Inaccessible platforms (e.g., SAP GUI, complex analytics interfaces, visual coding tools) block direct task execution.

---

### 2. HR & Industry Perspective

#### Why This Barrier Persists
* **Visual communication as the default:** Sighted employees naturally gravitate toward visual shortcuts (screenshots, slide decks, whiteboard snapshots) as the most efficient communication mechanism for themselves.
* **No habit reinforcement:** Coworkers lack practical reminders, automated guardrails, or nudges to maintain inclusive communication habits.
* **Procurement without a11y criteria:** Enterprise digital infrastructure is purchased solely for functional business requirements without accessibility testing.

#### What Employers Are Worried About
* **Direct operational productivity:** Fear that a visually impaired employee will be unable to operate mission-critical proprietary software autonomously.
* **Duplication of effort:** Reluctance among managers and colleagues to prepare duplicate sets of materials (one visual deck, one text/audio version).
* **Corporate IP and data privacy:** Deep skepticism regarding allowing third-party AI plugins or assistive cloud services to process proprietary internal documents and client records.

#### Constraints & Realities
* **Two-pronged solution required:** Addressing daily work requires both technical fixes (system compatibility) and behavioral change (team communication culture).
* **Practical micro-adjustments:** Sighted presenters sharing raw deck files beforehand allows screen-reader users to follow along; encouraging voice notes or descriptive text in team chats.
* **Limitations of generic consumer AI:** Visually impaired workers already use commercial vision models (ChatGPT, Gemini) to inspect screenshots, but manual copy-pasting is slow, lacks domain context, and raises compliance flags.
* **Smart glasses limitations:** Wearable assistive hardware remains expensive, socially obtrusive, and introduces severe enterprise privacy and camera recording compliance concerns.

---

## Stage 6: Workplace Communication, Skill Development & Retention
*(Working well with others, improving skills, and growing in the job)*

### Problem Statement
> *"Visually impaired employees face limited opportunities for career growth due to organisational development structures, inaccessible self-study materials, and inherent biases in communication and advancement processes."*

---

### 1. People with Lived Experience Perspective
* **Inaccessible professional learning:** Corporate training portals (LMS), e-learning courses, and third-party certifications rarely support screen-reader navigation or closed captions/transcripts.
* **Cost-prohibitive specialist materials:** Procuring accessible formats or custom assistive learning materials is often prohibitively expensive.
* **Visual/Interactive soft skill workshops:** Professional leadership training relies on physical roleplays, sticky-note exercises, and visual body language workshops that exclude non-sighted participants.
* **Provider exclusion:** External training vendors frequently decline to admit visually impaired professionals, claiming lack of accommodation capability.
* **Opaque promotional pathways:** Organizations lack visible, transparent criteria or adapted career development roadmaps for employees with disabilities.
* **Hidden executive job market:** Upward mobility relies heavily on informal executive search and casual professional networking, directly disadvantaging visually impaired professionals who are excluded from informal networking circles.
* **Stereotypes regarding executive capability:** Persistent biases suggest visually impaired individuals lack the capacity for high-level management.
* **Persistent visual gatekeeping:** Daily exclusion from visual presentations and dashboard discussions compounds over time, preventing candidates from demonstrating strategic leadership.

---

### 2. HR & Industry Perspective

#### Why This Barrier Persists
* **Word-of-mouth senior hiring:** Executive and leadership positions are filled through private networks and personal references rather than transparent internal job postings.
* **Absence of tailored retention tracks:** HR departments rarely design personalized career trajectory plans for talent with disabilities.
* **Implicit bias in leadership evaluation:** Executive presence is traditionally equated with visual cues—reading non-verbal room reactions, eye contact, and physical body language. Alternative styles of leadership are rarely recognized or nurtured.
* **Fragmented self-study ecosystems:** Corporate learning platforms lack consistent accessibility compliance, with no standardized guarantee of screen-reader friendliness.

#### What Employers Are Worried About
* **Uncertain ROI:** Reluctance to invest significant budget into bespoke training materials for a small number of visually impaired employees.
* **Additional operational costs:** Fear that promoting a visually impaired manager will require hiring a full-time human executive assistant.
* **Uncertainty around leadership execution:** Hesitation over how a visually impaired leader will facilitate visual meetings, interpret team dynamics, or represent the company at public events.

#### Constraints & Realities
* **The 70-20-10 development model:** Career growth is conventionally driven by 70% on-the-job experiential learning, 20% mentorship and manager feedback, and 10% formal coursework. Accessibility barriers currently cripple all three pillars.
* **Alignment requirement:** Long-term career progression requires mutual convergence of individual drive and organizational enablement; one cannot compensate for the total absence of the other.
* **The tripartite promotion barrier:** Advancement requires personal drive, core competency, and genuine organizational opportunity. A barrier in any single component stalls promotion.
* **Assistive tech limitations:** AI tools and assistive wearables are emerging but remain unstandardized, costly, and subject to corporate data governance constraints.
* **Reframing to business value:** Real data demonstrates that employees with disabilities have notably lower turnover rates, high loyalty, and strong analytical attention to detail. Solution design must lead with business value rather than altruism.

---

## Strategic Matrix: 6-Stage Problem Space vs. AI Solution Angles

| Stage | Primary Lived Barrier | Primary HR / Systemic Driver | Strategic AI / Hackathon Solution Angle |
| :--- | :--- | :--- | :--- |
| **1. Career Prep** | Inaccessible online postings, visual CV builders, visual networking | Aesthetics/SEO prioritized over a11y; fear of accommodation costs | **Source-level remediation & inclusive CV parsing**: AI that strips image-only job ads into structured screen-reader text; accessible voice/keyboard CV builders. |
| **2. Search & Apply** | Inaccessible candidate portals; AI ATS behavioral scoring bias | Lack of testing; ATS flagging non-standard navigation patterns | **Bias-audited / accessible candidate pipelines**: Automated ATS compliance validator; AI wrapper converting flat image descriptions into accessible text; automated WCAG linting. |
| **3. Interview** | Interviewer shock/bias; visual test tasks; lack of accommodation SOP | Unconscious bias; fear of productivity penalty and management cost | **Candidate capability showcase & interviewer coaching**: AI preparation coach that helps candidates demonstrate workflows upfront; automated employer accommodation cost/readiness estimator. |
| **4. Onboarding** | Inaccessible contracts & slides; IT security bans on screen readers; coworker awkwardness | Unchecked software procurement; lack of coworker briefing; data privacy paranoia | **Onboarding enablement & colleague etiquette guide**: AI colleague bot educating team on inclusive communication; privacy-compliant, on-prem/local document remediation agent. |
| **5. On the Job** | Real-time visual meeting slides; visual team chat (Slack/Teams/Zalo); inaccessible ERPs | Visual communication defaults; reluctance to create dual materials; security limits | **Real-time meeting companion & contextual visual explainer**: AI that ingests presenter slides via local/secure link and serves structured text/audio summaries; accessible spreadsheet/chart navigator. |
| **6. Skill & Retention** | Inaccessible LMS courses; visual leadership bias; informal networking gatekeeping | Executive hiring via closed networks; bias that leadership requires visual cueing | **Accessible career progression & micro-mentorship engine**: AI that renders corporate training materials into accessible formats; objective skill tracking to de-bias executive promotions. |

---

## Implications for Team Offixed (ADC Hackathon Strategy)

1. **Target the Systemic Workplace, Not the Individual:**
   * In full alignment with Team Offixed's core thesis (*"Fix the workplace, not the blind person"*), the brief demonstrates that the root bottleneck across every stage is **corporate systems, coworker behavior, and unexamined procurement**, not the visually impaired candidate's competence.
2. **Prioritize Privacy and Security (Stages 4 & 5):**
   * Employers are terrified of data leakage via cloud AI tools. Emphasize localized, privacy-first, or enterprise-audited AI architectures.
3. **De-bias Human Mindsets without Simulated Empathy (Stage 3):**
   * Avoid generic "empathy games". Provide tools that help candidates immediately showcase their real, concrete output and efficiency, preempting interviewer skepticism.
4. **Universal Design as an Economic Lever:**
   * When pitching solutions for Stages 4 and 5, highlight that accessible documentation, clean text presentations, and structured communication streamline workflows for *all* employees (e.g., remote workers, mobile users, neurodivergent staff), removing the objection that accessibility is an expensive accommodation for a single individual.
