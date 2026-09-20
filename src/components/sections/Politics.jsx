import { Text, Stack, Card, List, Anchor, Grid } from '@mantine/core';
import { useOutletContext } from 'react-router-dom';
import { RichText, ContentBlocks } from '../RichContent';

const SECTIONS = [
  { id: 'reglamentos', label: 'Reglamentos' },
  { id: 'entregas', label: 'Entrega de tareas/actividades/etc.' },
  { id: 'asistencia', label: 'Asistencia' },
  { id: 'puntualidad', label: 'Puntualidad' },
  { id: 'integridad-academica', label: 'Integridad Académica' },
  { id: 'disciplina', label: 'Disciplina' },
  { id: 'ia', label: 'Uso de Inteligencia Artificial Generativa' },
];

export default function Politics() {
  const { course } = useOutletContext();
  const { politics } = course;

  return (
    <Stack gap="xs">
      <Card shadow="sm" padding="lg" withBorder>
        <Text fz={16} fw={600}>
          Contenido
        </Text>
        <List fz={14} pt={4} spacing={4}>
          {SECTIONS.map((section) => (
            <List.Item key={section.id}>
              <Anchor href={`#${section.id}`} underline="hover" fz={14}>
                {section.label}
              </Anchor>
            </List.Item>
          ))}
        </List>
      </Card>

      <Card shadow="sm" padding="lg" withBorder>
        <Text fz={16} fw={600} id="reglamentos" data-overview-anchor>
          Reglamentos
        </Text>
        <Text fz={14} pt={4}>
          <RichText>{politics.rules}</RichText>
        </Text>

        <Text fz={16} fw={600} pt={20} id="entregas" data-overview-anchor>
          Entrega de tareas/actividades/etc.
        </Text>
        <ContentBlocks
          blocks={politics.activities}
          listProps={{ fz: 14, pt: 4, spacing: 4 }}
          textProps={{ fz: 14, pt: 4 }}
        />

        <Text fz={16} fw={600} pt={20} id="asistencia" data-overview-anchor>
          Asistencia
        </Text>
        <ContentBlocks
          blocks={politics.attendance}
          listProps={{ fz: 14, pt: 4, spacing: 4 }}
          textProps={{ fz: 14, pt: 4 }}
        />

        <Text fz={16} fw={600} pt={20} id="asistencia" data-overview-anchor>
          Puntualidad
        </Text>
        <ContentBlocks
          blocks={politics.timing}
          listProps={{ fz: 14, pt: 4, spacing: 4 }}
          textProps={{ fz: 14, pt: 4 }}
        />

        <Text fz={16} fw={600} pt={20} id="integridad-academica" data-overview-anchor>
          Integridad Académica
        </Text>
        <ContentBlocks
          blocks={politics.integrity}
          listProps={{ fz: 14, pt: 4, spacing: 4 }}
          textProps={{ fz: 14, pt: 4 }}
        />

        <Text fz={16} fw={600} pt={20} id="integridad-academica" data-overview-anchor>
          Disciplina
        </Text>
        <ContentBlocks
          blocks={politics.discipline}
          listProps={{ fz: 14, pt: 4, spacing: 4 }}
          textProps={{ fz: 14, pt: 4 }}
        />

        <Text fz={16} fw={600} pt={20} id="integridad-academica" data-overview-anchor>
          Uso de Inteligencia Artificial Generativa
        </Text>
        <ContentBlocks
          blocks={politics.ia}
          listProps={{ fz: 14, pt: 4, spacing: 4 }}
          textProps={{ fz: 14, pt: 4 }}
        />

        
      </Card>
    </Stack>
  );
}
