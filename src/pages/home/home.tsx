import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/shared/components/ui/button/button';
import { Alert } from '@/shared/components/ui/alert/alert';
import { Badge } from '@/shared/components/ui/badge/badge';
import { Spinner } from '@/shared/components/ui/spinner/spinner';
import { Accordion } from '@/shared/components/ui/accordion/accordion';
import { Tabs } from '@/shared/components/ui/tabs/tabs';
import { Modal } from '@/shared/components/ui/modal/modal';
import { Input } from '@/shared/components/ui/input/input';
import { Tooltip } from '@/shared/components/ui/tooltip/tooltip';
import { Checkbox } from '@/shared/components/ui/checkbox/checkbox';
import { ToggleSwitch } from '@/shared/components/ui/toggleSwitch/toggleSwitch';
import { TextArea } from '@/shared/components/ui/textArea/textArea';
import { ThemeToggle } from '@/shared/components/ui/themeToggle/themeToggle';
import { useToast } from '@/shared/components/ui/toast/toast';
import { ROUTES } from '@/shared/lib/config/routes';
import styles from './home.module.scss';

export function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [toggled, setToggled] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const { addToast } = useToast();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>React Template</h1>
          <div className={styles.headerActions}>
            <ThemeToggle />
            <Link to={ROUTES.LOGIN}>
              <Button variant="primary" size="sm">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
        <p className={styles.subtitle}>
          A production-ready React starter with Vite, TypeScript, Redux,
          Tailwind CSS, and a full UI component library.
        </p>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Buttons</h2>
          <div className={styles.row}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" isLoading>
              Loading
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
          <div className={styles.row}>
            <Button variant="primary" size="sm">
              Small
            </Button>
            <Button variant="primary" size="md">
              Medium
            </Button>
            <Button variant="primary" size="lg">
              Large
            </Button>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Badges</h2>
          <div className={styles.row}>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="primary" pill>
              Pill
            </Badge>
          </div>
        </section>

        {showAlert && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Alerts</h2>
            <div className={styles.stack}>
              <Alert
                variant="info"
                title="Information"
                onClose={() => setShowAlert(false)}
              >
                This is an info alert with a close button.
              </Alert>
              <Alert variant="success" title="Success!">
                Operation completed successfully.
              </Alert>
              <Alert variant="warning" title="Warning">
                Please review before continuing.
              </Alert>
              <Alert variant="error" title="Error">
                Something went wrong.
              </Alert>
            </div>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Form Controls</h2>
          <div className={styles.formGrid}>
            <Input label="Email" placeholder="you@example.com" type="email" />
            <Input
              label="Password"
              placeholder="Enter password"
              type="password"
            />
            <Input
              label="With Error"
              placeholder="Invalid field"
              error="This field is required"
            />
            <Input
              label="With Help"
              placeholder="Enter value"
              helpText="This is optional"
            />
          </div>
          <div className={styles.formGrid}>
            <TextArea
              label="Message"
              placeholder="Write your message..."
              rows={3}
              maxLength={200}
              showCount
            />
          </div>
          <div className={styles.row}>
            <Checkbox
              label="Accept terms"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <ToggleSwitch
              label="Enable notifications"
              checked={toggled}
              onChange={(e) => setToggled(e.target.checked)}
            />
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Accordion</h2>
          <Accordion defaultExpanded={['faq-1']} allowMultiple>
            <Accordion.Item id="faq-1">
              <Accordion.Trigger>What is this template?</Accordion.Trigger>
              <Accordion.Content>
                A production-ready React starter with TypeScript, Vite, Redux
                Toolkit, and a complete UI component library.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item id="faq-2">
              <Accordion.Trigger>How do I add a new page?</Accordion.Trigger>
              <Accordion.Content>
                Create a page component under src/pages/, add a ROUTES constant,
                and register it in App.tsx.
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item id="faq-3">
              <Accordion.Trigger>How does theming work?</Accordion.Trigger>
              <Accordion.Content>
                CSS custom properties define all theme tokens. Toggle the dark
                class on the html element to switch themes.
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Tabs</h2>
          <Tabs defaultTab="overview">
            <Tabs.List>
              <Tabs.Tab id="overview">Overview</Tabs.Tab>
              <Tabs.Tab id="features">Features</Tabs.Tab>
              <Tabs.Tab id="setup">Setup</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel id="overview">
              <p>
                This template provides a solid foundation for building React
                applications.
              </p>
            </Tabs.Panel>
            <Tabs.Panel id="features">
              <p>
                Includes routing, state management, form validation, theming,
                and 17+ UI components.
              </p>
            </Tabs.Panel>
            <Tabs.Panel id="setup">
              <p>
                Run <code>npm install</code> then <code>npm run dev</code> to
                get started.
              </p>
            </Tabs.Panel>
          </Tabs>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Modal &amp; Tooltip</h2>
          <div className={styles.row}>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
            <Tooltip content="This is a tooltip!" position="top">
              <Button variant="outline">Hover for Tooltip</Button>
            </Tooltip>
          </div>
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            size="md"
          >
            <Modal.Header
              title="Example Modal"
              onClose={() => setIsModalOpen(false)}
            />
            <Modal.Content>
              <p>
                This is a modal dialog. It supports keyboard navigation and
                overlay click to close.
              </p>
            </Modal.Content>
            <Modal.Footer>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                Confirm
              </Button>
            </Modal.Footer>
          </Modal>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Toast Notifications</h2>
          <div className={styles.row}>
            <Button
              variant="primary"
              onClick={() =>
                addToast({
                  title: 'Success',
                  description: 'Your changes have been saved.',
                  variant: 'success',
                  duration: 4000,
                })
              }
            >
              Success Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                addToast({
                  title: 'Info',
                  description: 'New update available.',
                  variant: 'info',
                  duration: 4000,
                })
              }
            >
              Info Toast
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                addToast({
                  title: 'Warning',
                  description: 'Your session expires in 5 minutes.',
                  variant: 'warning',
                  duration: 4000,
                })
              }
            >
              Warning Toast
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                addToast({
                  title: 'Error',
                  description: 'Failed to save changes.',
                  variant: 'error',
                  duration: 4000,
                })
              }
            >
              Error Toast
            </Button>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Spinner</h2>
          <div className={styles.row}>
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <Spinner size="xl" />
          </div>
        </section>
      </main>
    </div>
  );
}
