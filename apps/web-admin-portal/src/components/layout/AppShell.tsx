import type { ReactNode } from 'react';
import { Container, Row, Col, Breadcrumb } from 'react-bootstrap';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebar } from '../../contexts/SidebarContext';

interface AppShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
}

export function AppShell({ children, title, subtitle, breadcrumbs, actions }: AppShellProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="admin-portal">
      <Sidebar />
      <Header />

      <main className={`page-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="content">
          {/* Page Header */}
          {(title || actions) && (
            <div className="page-header">
              <Container fluid className="px-0">
                <Row className="align-items-center">
                  <Col>
                    {breadcrumbs && breadcrumbs.length > 0 && (
                      <Breadcrumb className="mb-2">
                        <Breadcrumb.Item href="/dashboard">
                          <i className="ti ti-home me-1" />
                          Home
                        </Breadcrumb.Item>
                        {breadcrumbs.map((item, index) => (
                          <Breadcrumb.Item
                            key={index}
                            href={item.href}
                            active={index === breadcrumbs.length - 1}
                          >
                            {item.label}
                          </Breadcrumb.Item>
                        ))}
                      </Breadcrumb>
                    )}
                    {title && <h3 className="mb-0">{title}</h3>}
                    {subtitle && <p className="text-muted mb-0 mt-1">{subtitle}</p>}
                  </Col>
                  {actions && (
                    <Col xs="auto">
                      <div className="d-flex align-items-center gap-2">
                        {actions}
                      </div>
                    </Col>
                  )}
                </Row>
              </Container>
            </div>
          )}

          {/* Page Content */}
          {children}
        </div>
      </main>
    </div>
  );
}
