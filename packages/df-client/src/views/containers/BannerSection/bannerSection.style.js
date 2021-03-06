import styled, { keyframes } from 'styled-components';
import { themeGet } from '@styled-system/theme-get';

const shake = keyframes`
0% {
  transform: translateX(0);
}
50% {
  transform: translateX(8px);
}
100% {
  transform: translateX(0);
}
`;

const BannerWrapper = styled.div`
  display: flex;
  height: 55vh;
  margin-bottom: 81px;
  @media only screen and (max-width: 1360px) {
    margin-bottom: 50px;
  }
  @media only screen and (max-width: 991px) {
    height: auto;
    margin-bottom: 40px;
  }
  @media only screen and (max-width: 667px) {
    min-height: 100vh;
    height: auto;
  }

  .leftbar {
    width: 230px;
    flex-shrink: 1;
    display: flex;
    @media only screen and (max-width: 1440px) {
      width: 170px;
    }
    @media only screen and (max-width: 1360px) {
      display: none;
    }

    .smooth_scroll {
      display: block;
      transform: rotate(-90deg);
      margin-bottom: 74px;
      font-size: 18px;
      font-weight: 600;
      color: #93a2ab;
      transition: all 0.3s ease;
      @media only screen and (max-width: 1440px) {
        font-size: 16px;
        margin-bottom: 66px;
      }
      .btn_text {
        margin-left: 20px;
      }
      i {
        /* transform: translateX(6px); */
        display: inline-flex;
      }
      &:hover {
        color: ${themeGet('colors.text', '#294859')};

        i {
          animation: ${shake} 1s infinite;
        }
      }
    }
  }
`;

export const ContentWrapper = styled.div`
  display: flex;
  width: calc(100%);
  @media only screen and (max-width: 1440px) {
    width: calc(100% - 170px);
  }
  @media only screen and (max-width: 1360px) {
    width: calc(100%);
  }
  @media only screen and (max-width: 667px) {
    flex-direction: column;
  }
`;

export const TextArea = styled.div`
  width: 450px;
  align-self: center;
  padding-right: 45px;
  padding-top: 250px;
  @media only screen and (max-width: 1360px) {
    width: 470px;
    margin-left: 30px;
    padding-right: 30px;
  }
  @media only screen and (max-width: 991px) {
    width: 350px;
  }
  @media only screen and (max-width: 667px) {
    width: calc(100% - 30px);
    max-width: 480px;
    align-self: flex-start;
    padding-top: 160px;
  }

  h2 {
    font-size: 50px;
    line-height: 70px;
    font-weight: 900;
    margin-bottom: 27px;
    @media only screen and (max-width: 1440px) {
      font-size: 46px;
      line-height: 64px;
      margin-bottom: 20px;
    }
    @media only screen and (max-width: 1360px) {
      font-size: 42px;
      line-height: 50px;
      margin-bottom: 25px;
    }
    @media only screen and (max-width: 480px) {
      font-size: 36px;
      line-height: 46px;
      margin-bottom: 20px;
    }
  }

  h4 {
    font-size: 25px;
    line-height: 40px;
    font-weight: 400;
    color: ${themeGet('colors.text', '#294859')};
    margin-bottom: 22px;
    @media only screen and (max-width: 1440px) {
      font-size: 22px;
      line-height: 40px;
    }
    @media only screen and (max-width: 1360px) {
      font-size: 18px;
      line-height: 30px;
    }
  }

  p {
    font-size: 18px;
    line-height: 28px;
    margin-bottom: 45px;
    @media only screen and (max-width: 1440px) {
      font-size: 16px;
      margin-bottom: 40px;
    }
    @media only screen and (max-width: 1360px) {
      font-size: 15px;
      margin-bottom: 40px;
    }

    &.highlighted_text {
      margin: 0 0 40px;
      font-size: 14px;
      line-height: 17px;
      color: ${themeGet('colors.heading', '#060F1E')};
      @media only screen and (max-width: 1440px) {
        margin: 0 0 30px;
      }
    }
  }
`;

export const HighlightedText = styled.p`
  display: flex;
  align-items: center;
  max-width: 320px;
  width: 100%;
  min-height: 28px;
  border-radius: 80px;
  padding: 3px 28px 3px 4px;
  background-color: #eff0f0;

  strong {
    display: inline-flex;
    align-items: center;
    min-width: 51px;
    min-height: 20px;
    padding: 3px 11px;
    border-radius: 30px;
    font-size: 10px;
    text-transform: uppercase;
    color: ${themeGet('colors.white', '#ffffff')};
    background-color: ${themeGet('colors.secondary', '#D50032')};
    margin-right: 10px;
  }
`;

export const ImageArea = styled.div`
  width: calc(100% - 450px);
  @media only screen and (max-width: 1360px) {
    width: calc(100% - 500px);
  }
  @media only screen and (max-width: 991px) {
    width: calc(100% - 380px);
  }
  @media only screen and (max-width: 667px) {
    width: 100%;
    height: 0px;
    padding: 70px 0 40px;
  }

  #homeBanner {
      height: 70vh;
      @media only screen and (max-width: 991px) {
        height: 762px;
      }
      @media only screen and (max-width: 667px) {
        height: 380px;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
`;

export default BannerWrapper;
