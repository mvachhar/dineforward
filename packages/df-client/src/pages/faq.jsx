import React, { Fragment } from 'react';
import { request } from 'graphql-request';

import Typography from '@material-ui/core/Typography';

import ContentPage from '~containers/ContentPage';
import NewLayout from '~components/NewLayout';
import { CharityWrapper, ContentWrapper } from '~containers/dineforward.style';
import TabbedPanels from '~components/TabbedPanels';

const API_URL = process.env.API_URL || 'http://localhost:8000/admin/api';

const FaqPage = props => {
  const { name, blocks } = props;

  return (
    <NewLayout navbar>
      <ContentPage title="FAQ" subtitle="Your Frequently asked questions, answered">
        <Typography>{name}</Typography>
        <TabbedPanels
          tabs={[
            {
              name: 'Supporter FAQ',
              label: 'faq',
              content: () => <div dangerouslySetInnerHTML={{ __html: blocks[0].richContent }} />,
            },
            {
              name: 'Business FAQ',
              label: 'faq',
              content: () => <div dangerouslySetInnerHTML={{ __html: blocks[1].richContent }} />,
            },
          ]}
        />
      </ContentPage>
    </NewLayout>
  );
};

export const getStaticProps = async () => {
  const FAQ_PAGE = `
        query allContentPages{
          allContentPages(where:{slug:"faq"}){
            name,
            blocks(orderBy:"createdAt"){
              name,
              title,
              subtitle,
              image{path},
              textContent, 
              richContent
            }
          }
        }`;
  const { allContentPages } = await request(API_URL, FAQ_PAGE).then(data => {
    return data;
  });

  return { props: allContentPages[0] };
};

// export const getStaticpaths = async () => {
//   return {};
// };

export default FaqPage;