import { Text, Stack, Card, Grid } from '@mantine/core';
import { useOutletContext } from 'react-router-dom';
import { RichText } from '../RichContent';

export default function Landing() {
  const { course } = useOutletContext();
  const data = course.landing;

  return (
    <Stack gap="xs">
      <Card shadow="sm" padding="lg" withBorder>
        <Text fz={16} fw={600}>
          Acerca del curso
        </Text>
        <Text fz={14}>
          <RichText>{data.description}</RichText>
        </Text>
        <Grid gap="xs" pt={25}>
          <Grid.Col span={4}>
            <Text fz={16} fw={600}>
              Fechas:
            </Text>
          </Grid.Col>
          <Grid.Col span={8}>
            <Text fz={14} fw={400}  >
              {data.dates}
            </Text>
            </Grid.Col>
          <Grid.Col span={4}>
            <Text fz={16} fw={600}>
              Horarios:
            </Text>
          </Grid.Col>
          <Grid.Col span={8}>
            <Text fz={14} fw={400}  >
              {data.horarios}
            </Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Text fz={16} fw={600}>
              Ubicacion:
            </Text>
          </Grid.Col>
          <Grid.Col span={8}>
            <Text fz={14} fw={400} >
              {data.ubicacion}
            </Text>
          </Grid.Col>
        </Grid>
      </Card>
    </Stack>
  );
}
