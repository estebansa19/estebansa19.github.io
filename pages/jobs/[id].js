import Head from 'next/head';
import Layout from '../../components/layout';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';
import { getAllJobsIds, getJobData } from '../../lib/jobs';

export async function getStaticProps({ params }) {
  const jobData = await getJobData(params.id);
  return {
    props: {
      jobData,
    },
  };
}

export async function getStaticPaths() {
  const paths = getAllJobsIds();

  return {
    paths,
    fallback: false
  };
}

export default function Job({ jobData }) {
  return(
    <Layout>
      <Head>
        <title>{jobData.title}</title>
      </Head>

      <article>
        <h1 className={utilStyles.headingXl}>{jobData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={jobData.date_start} /> - <Date dateString={jobData.date_end} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: jobData.contentHtml }}/>
      </article>
    </Layout>
  );
}
