import { Text, Stack, Card, List, Anchor, Grid } from '@mantine/core';
import { useOutletContext } from 'react-router-dom';
import { RichText, ContentBlocks } from '../RichContent';

const SECTIONS = [
  { id: 'objetivos-asignatura', label: 'Objetivos asignatura' },
  { id: 'resultados-aprendizaje', label: 'Resultados aprendizaje' },
  { id: 'esquema-general', label: 'Esquema General' },
  { id: 'evaluacion-curso', label: 'Evaluación del Curso' },
  { id: 'proyecto-final', label: 'Proyecto Final' },
  { id: 'asesorias', label: 'Asesorías' },
  { id: 'software', label: 'Software' },
];

export default function Overview() {
  const { course } = useOutletContext();
  const { overview } = course;

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
        <Text fz={16} fw={600} id="objetivos-asignatura" data-overview-anchor>
          Objetivos de la asignatura
        </Text>
        <Text fz={14} pt={4}>
          <RichText>{overview.objectives}</RichText>
        </Text>

        <Text fz={16} fw={600} pt={20} id="resultados-aprendizaje" data-overview-anchor>
          Objetivos
        </Text>
        <ContentBlocks
          blocks={overview.learning}
          listProps={{ fz: 14, pt: 4, spacing: 4 }}
          textProps={{ fz: 14, pt: 4 }}
        />

        <Text fz={16} fw={600} pt={20} id="esquema-general" data-overview-anchor>
          Esquema General
        </Text>
        <ContentBlocks
          blocks={overview.structure}
          listProps={{ fz: 14, pt: 4, spacing: 4 }}
          textProps={{ fz: 14, pt: 4 }}
        />

        <Text fz={16} fw={600} pt={20} id="evaluacion-curso" data-overview-anchor>
          Evaluación del Curso
        </Text>
          {Object.entries(overview.evaluation).map(([key, value]) => (
            <Grid gap="xs" pt={25} pl={20}>
              <Grid.Col span={1}>
                <Text fz={14} fw={600}>
                  {key}%
                </Text>
              </Grid.Col>
                <Grid.Col span={11}>
                  <Text fz={14} fw={400}  >
                    <RichText>{value}</RichText>
                  </Text>
                </Grid.Col>
            </Grid>
          ))}

        <Text fz={16} fw={600} pt={20} id="proyecto-final" data-overview-anchor>
          Proyecto Final
        </Text>
        <Text fz={14} pt={4}>
          <RichText>{overview.project.resume}</RichText>
        </Text>

        <Text fz={14} pt={15}>
          <RichText>{overview.project.detail}</RichText>
        </Text>

        <Text fz={14} pt={15}>
          <RichText>{overview.project.team}</RichText>
        </Text>

        <Text fz={16} fw={600} pt={20} id="asesorias" data-overview-anchor>
          Asesorías
        </Text>
        <ContentBlocks
          blocks={overview.help}
          listProps={{ fz: 14, pt: 4, spacing: 4 }}
          textProps={{ fz: 14, pt: 4 }}
        />

        <Text fz={16} fw={600} pt={20} id="software" data-overview-anchor>
          Software
        </Text>
        <Text fz={14} pt={4}>
          <RichText>{overview.software}</RichText>
        </Text>
        
      </Card>
    </Stack>
  );
}
